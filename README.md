# Direct Meds Dashboard - Simple CSV Version

This version avoids Google Cloud, OAuth, service accounts, and API credentials.

It reads from one published CSV feed only. That feed should be the sanitized `Dashboard_Safe_Data` tab, not `Normalized_Data`.

## Expected columns

The app expects `Dashboard_Safe_Data` columns A:O to be:

1. Timestamp
2. Sale Date
3. GLPs
4. Other
5. Add-Ons
6. How Closed
7. Team
8. Portal Address
9. Agent Name
10. Deal ID
11. Total Deals
12. Day of Week
13. Week Start
14. Month
15. Weekend?

## Important security note

Publishing a Google Sheet tab to CSV means anyone with that CSV URL can technically access the data in that tab.

Only publish the sanitized `Dashboard_Safe_Data` tab. Do not publish `Normalized_Data`.

If Portal Address should not be accessible to anyone with the CSV link, remove Portal Address from the published tab or use the Google-login version later.

## How to publish the safe tab as CSV

1. Open your Google Sheet.
2. Go to **File > Share > Publish to web**.
3. Under **Link**, choose only `Dashboard_Safe_Data`.
4. Change format from webpage to **Comma-separated values (.csv)**.
5. Click **Publish**.
6. Copy the generated link.
7. Use that link as the `DASHBOARD_CSV_URL` environment variable.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Railway setup

1. Upload this folder to GitHub.
2. In Railway, create a new project from the GitHub repo.
3. Add one environment variable:

```text
DASHBOARD_CSV_URL=your_published_csv_link
```

4. Deploy.

## What is included

- Direct Meds branded dashboard
- KPI cards
- Team, agent, month, close type, and search filters
- Daily trend chart
- Team comparison chart
- Product mix chart
- Top agents chart
- Deal table with Portal button

