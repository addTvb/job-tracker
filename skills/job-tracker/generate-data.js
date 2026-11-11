#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// Repo root = skills/job-tracker/../..
const REPO_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_DIR = process.env.JOB_APP_TRACKER_DIR
  ? path.resolve(process.env.JOB_APP_TRACKER_DIR)
  : path.join(REPO_ROOT, 'tracker');

const HEADERS = [
  'id',
  'date',
  'company',
  'role',
  'track',
  'source',
  'url',
  'status',
  'updated_at',
  'notes',
];

const STATUSES = [
  'sent',
  'replied',
  'interview',
  'offer',
  'rejected',
  'ghosted',
  'withdrawn',
];

const TRACKS = ['frontend', 'fullstack'];
const SOURCES = ['hh', 'linkedin', 'referral', 'company_site', 'other'];
const FUNNEL = ['sent', 'replied', 'interview', 'offer'];
const IN_PIPELINE = new Set(['sent', 'replied', 'interview']);
const STALE_SENT_DAYS = 14;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function parseCsv(text) {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];
  const header = parseCsvLine(lines[0]);
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = cols[j] != null ? cols[j] : '';
    }
    records.push(row);
  }
  return records;
}

function serializeCsv(records) {
  const lines = [HEADERS.join(',')];
  for (const r of records) {
    lines.push(HEADERS.map((h) => csvEscape(r[h] ?? '')).join(','));
  }
  return lines.join('\n') + '\n';
}

function isoWeekKey(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return 'unknown';
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function monthKey(dateStr) {
  if (!dateStr || dateStr.length < 7) return 'unknown';
  return dateStr.slice(0, 7);
}

function rate(num, den) {
  if (!den) return null;
  return Math.round((num / den) * 1000) / 10;
}

function daysBetween(fromIso, toDate = new Date()) {
  const from = new Date(fromIso.includes('T') ? fromIso : fromIso + 'T12:00:00');
  if (Number.isNaN(from.getTime())) return null;
  const ms = toDate.getTime() - from.getTime();
  return Math.floor(ms / 86400000);
}

function computeMetrics(records) {
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  const bySource = Object.fromEntries(SOURCES.map((s) => [s, 0]));
  const byTrack = Object.fromEntries(TRACKS.map((t) => [t, 0]));
  const byWeek = {};
  const byMonth = {};

  let inPipeline = 0;
  const enriched = records.map((r) => {
    const status = r.status || 'sent';
    if (byStatus[status] != null) byStatus[status]++;
    else byStatus[status] = (byStatus[status] || 0) + 1;

    if (bySource[r.source] != null) bySource[r.source]++;
    else if (r.source) bySource[r.source] = (bySource[r.source] || 0) + 1;

    if (byTrack[r.track] != null) byTrack[r.track]++;
    else if (r.track) byTrack[r.track] = (byTrack[r.track] || 0) + 1;

    const wk = isoWeekKey(r.date);
    byWeek[wk] = (byWeek[wk] || 0) + 1;
    const mk = monthKey(r.date);
    byMonth[mk] = (byMonth[mk] || 0) + 1;

    if (IN_PIPELINE.has(status)) inPipeline++;

    const daysSinceUpdate = daysBetween(r.updated_at || r.date);
    return { ...r, daysSinceUpdate };
  });

  const total = records.length;
  const gotReply =
    (byStatus.replied || 0) +
    (byStatus.interview || 0) +
    (byStatus.offer || 0);
  const gotInterview = (byStatus.interview || 0) + (byStatus.offer || 0);

  const staleSent = enriched.filter(
    (r) =>
      r.status === 'sent' &&
      r.daysSinceUpdate != null &&
      r.daysSinceUpdate > STALE_SENT_DAYS
  );

  const funnelReached = {
    sent: total,
    replied: gotReply,
    interview: gotInterview,
    offer: byStatus.offer || 0,
  };

  return {
    records: enriched,
    metrics: {
      total,
      inPipeline,
      byStatus,
      bySource,
      byTrack,
      byWeek: Object.fromEntries(
        Object.entries(byWeek).sort(([a], [b]) => a.localeCompare(b))
      ),
      byMonth: Object.fromEntries(
        Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b))
      ),
      funnelReached,
      rates: {
        replyRate: rate(gotReply, total),
        interviewRate: rate(gotInterview, total),
        offerRate: rate(byStatus.offer || 0, total),
        rejectRate: rate(byStatus.rejected || 0, total),
        ghostRate: rate(byStatus.ghosted || 0, total),
      },
      staleSentCount: staleSent.length,
      staleSentDays: STALE_SENT_DAYS,
    },
  };
}

function readRecords(dir) {
  const csvPath = path.join(dir, 'applications.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found: ${csvPath}`);
  }
  return { csvPath, records: parseCsv(fs.readFileSync(csvPath, 'utf8')) };
}

function writeCsv(dir, records) {
  const csvPath = path.join(dir, 'applications.csv');
  fs.writeFileSync(csvPath, serializeCsv(records), 'utf8');
  return csvPath;
}

function writeDataJs(dir, payload) {
  const outPath = path.join(dir, 'data.js');
  const body =
    'window.JOB_TRACKER_DATA = ' +
    JSON.stringify(payload, null, 2) +
    ';\n';
  fs.writeFileSync(outPath, body, 'utf8');
  return outPath;
}

function regenerate(dir) {
  const { records } = readRecords(dir);
  const { records: enriched, metrics } = computeMetrics(records);
  const payload = {
    generatedAt: new Date().toISOString(),
    records: enriched,
    metrics,
  };
  const outPath = writeDataJs(dir, payload);
  return { outPath, metrics, records: enriched };
}

function nextId(records, dateStr) {
  const prefix = dateStr + '-';
  let max = 0;
  for (const r of records) {
    if (r.id && r.id.startsWith(prefix)) {
      const n = parseInt(r.id.slice(prefix.length), 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
  }
  return prefix + String(max + 1).padStart(3, '0');
}

function todayDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, '');
}

function findRecord(records, query) {
  if (!query) return null;
  const q = String(query).trim().toLowerCase();
  let hit = records.find((r) => r.id.toLowerCase() === q);
  if (hit) return hit;
  hit = records.find((r) => (r.url || '').toLowerCase() === q);
  if (hit) return hit;
  const matches = records.filter(
    (r) =>
      (r.company || '').toLowerCase().includes(q) ||
      `${r.company} ${r.role}`.toLowerCase().includes(q)
  );
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    const err = new Error(
      'Ambiguous match: ' + matches.map((m) => m.id).join(', ')
    );
    err.matches = matches;
    throw err;
  }
  return null;
}

function cmdGenerate(dir) {
  const { outPath, metrics } = regenerate(dir);
  console.log(`Wrote ${outPath}`);
  console.log(
    JSON.stringify(
      {
        total: metrics.total,
        inPipeline: metrics.inPipeline,
        rates: metrics.rates,
        byStatus: metrics.byStatus,
      },
      null,
      2
    )
  );
}

function cmdAdd(dir, args) {
  const company = args.company;
  const role = args.role;
  if (!company || !role) {
    throw new Error('--company and --role are required');
  }
  const track = (args.track || 'frontend').toLowerCase();
  const source = (args.source || 'other').toLowerCase();
  if (!TRACKS.includes(track)) {
    throw new Error(`Invalid track: ${track}. Use: ${TRACKS.join(', ')}`);
  }
  if (!SOURCES.includes(source)) {
    throw new Error(`Invalid source: ${source}. Use: ${SOURCES.join(', ')}`);
  }
  const { records } = readRecords(dir);
  const date = args.date || todayDate();
  const id = args.id || nextId(records, date);
  if (records.some((r) => r.id === id)) {
    throw new Error(`Duplicate id: ${id}`);
  }
  const row = {
    id,
    date,
    company,
    role,
    track,
    source,
    url: args.url || '',
    status: 'sent',
    updated_at: nowIso(),
    notes: args.notes || '',
  };
  records.push(row);
  writeCsv(dir, records);
  const { metrics } = regenerate(dir);
  console.log(
    JSON.stringify({ ok: true, record: row, metrics: { total: metrics.total, rates: metrics.rates } }, null, 2)
  );
}

function cmdStatus(dir, args) {
  const status = (args.status || args._[1] || '').toLowerCase();
  const query = args.id || args.company || args.url || args.q || args._[0];
  if (!query || !status) {
    throw new Error('Usage: status --id <id|company|url> --status <status>');
  }
  if (!STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}. Use: ${STATUSES.join(', ')}`);
  }
  const { records } = readRecords(dir);
  const hit = findRecord(records, query);
  if (!hit) throw new Error(`Record not found: ${query}`);
  hit.status = status;
  hit.updated_at = nowIso();
  writeCsv(dir, records);
  const { metrics } = regenerate(dir);
  console.log(
    JSON.stringify({ ok: true, record: hit, metrics: { total: metrics.total, byStatus: metrics.byStatus, rates: metrics.rates } }, null, 2)
  );
}

function cmdList(dir, args) {
  const { records } = readRecords(dir);
  let list = [...records].sort((a, b) =>
    (b.updated_at || b.date).localeCompare(a.updated_at || a.date)
  );
  if (args.status) {
    list = list.filter((r) => r.status === args.status);
  }
  const limit = parseInt(args.limit || '10', 10);
  list = list.slice(0, limit);
  console.log(JSON.stringify(list, null, 2));
}

function cmdStats(dir) {
  const { metrics } = regenerate(dir);
  console.log(JSON.stringify(metrics, null, 2));
}

function resolveDir(args, command) {
  if (args.dir) return path.resolve(args.dir);
  if (command && command.startsWith('/')) return path.resolve(command);
  if (command === 'generate' && args._[1]) return path.resolve(args._[1]);
  return path.resolve(DEFAULT_DIR);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  const COMMANDS = new Set(['generate', 'add', 'status', 'list', 'stats']);

  try {
    if (!command || command === 'generate' || (command && !COMMANDS.has(command))) {
      const target = resolveDir(args, command && !COMMANDS.has(command) ? command : 'generate');
      cmdGenerate(target);
      return;
    }

    const resolved = resolveDir(args, command);
    switch (command) {
      case 'add':
        cmdAdd(resolved, args);
        break;
      case 'status':
        cmdStatus(resolved, { ...args, _: args._.slice(1) });
        break;
      case 'list':
        cmdList(resolved, args);
        break;
      case 'stats':
        cmdStats(resolved);
        break;
      default:
        throw new Error(
          `Unknown command: ${command}. Use: generate | add | status | list | stats`
        );
    }
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

main();
