
 ⛅️ wrangler 4.32.0 (update available 4.34.0)
─────────────────────────────────────────────
🌀 Executing on local database kwikr-production (b0db02fd-d6f3-41e4-b7a7-383b8bc08cb0) from .wrangler/state/v3/d1:
🌀 To execute on your remote database, add a --remote flag to your wrangler command.
🚣 1 command executed successfully.
[
  {
    "results": [
      {
        "query": "DELETE FROM worker_services WHERE user_id IN (SELECT id FROM users WHERE role = 'worker');"
      },
      {
        "query": "DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE role = 'worker');"
      },
      {
        "query": "DELETE FROM users WHERE role = 'worker';"
      }
    ],
    "success": true,
    "meta": {
      "duration": 1
    }
  }
]
