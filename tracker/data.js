window.JOB_TRACKER_DATA = {
  "generatedAt": "2026-11-11T06:47:44.889Z",
  "records": [
    {
      "id": "2026-03-09-001",
      "date": "2026-03-09",
      "company": "Northwind Labs",
      "role": "Frontend Engineer",
      "track": "frontend",
      "source": "linkedin",
      "url": "https://example.com/jobs/northwind-fe",
      "status": "interview",
      "updated_at": "2026-03-11T10:00:00",
      "notes": "Sample screening passed",
      "daysSinceUpdate": 245
    },
    {
      "id": "2026-03-10-001",
      "date": "2026-03-10",
      "company": "Blue Harbor",
      "role": "Full-Stack Developer",
      "track": "fullstack",
      "source": "hh",
      "url": "https://example.com/jobs/blue-harbor-fs",
      "status": "sent",
      "updated_at": "2026-03-10T18:30:00",
      "notes": "Sample row",
      "daysSinceUpdate": 245
    },
    {
      "id": "2026-03-10-002",
      "date": "2026-03-10",
      "company": "Pixel Grove",
      "role": "React Developer",
      "track": "frontend",
      "source": "referral",
      "url": "",
      "status": "rejected",
      "updated_at": "2026-03-11T09:15:00",
      "notes": "Sample rejection note",
      "daysSinceUpdate": 245
    }
  ],
  "metrics": {
    "total": 3,
    "inPipeline": 2,
    "byStatus": {
      "sent": 1,
      "replied": 0,
      "interview": 1,
      "offer": 0,
      "rejected": 1,
      "ghosted": 0,
      "withdrawn": 0
    },
    "bySource": {
      "hh": 1,
      "linkedin": 1,
      "referral": 1,
      "company_site": 0,
      "other": 0
    },
    "byTrack": {
      "frontend": 2,
      "fullstack": 1
    },
    "byWeek": {
      "2026-W11": 3
    },
    "byMonth": {
      "2026-03": 3
    },
    "funnelReached": {
      "sent": 3,
      "replied": 1,
      "interview": 1,
      "offer": 0
    },
    "rates": {
      "replyRate": 33.3,
      "interviewRate": 33.3,
      "offerRate": 0,
      "rejectRate": 33.3,
      "ghostRate": 0
    },
    "staleSentCount": 1,
    "staleSentDays": 14
  }
};
