# SwasthyaCare Disaster Recovery, Backup & Incident Response Runbook

## 1. Overview
This document specifies standard operating procedures (SOP) for data protection, disaster recovery, service failover, and operational triage within the SwasthyaCare ecosystem.

---

## 2. Database Backup & Restoration

### 2.1 Automated Scheduled Backups (`mongodump`)
For production and staging deployments, automated compressed archive backups must execute every 6 hours:
```bash
# Export compressed binary archive of swasthyacare database
mongodump --uri="mongodb://localhost:27017/swasthyacare" --archive="/var/backups/swasthya_$(date +%Y%m%d_%H%M%S).gz" --gzip
```

### 2.2 Point-In-Time Restoration (`mongorestore`)
In the event of accidental data corruption or hardware failure:
```bash
# 1. Stop incoming API traffic (drain connections)
# 2. Restore from verified compressed archive
mongorestore --uri="mongodb://localhost:27017/swasthyacare" --drop --archive="/var/backups/swasthya_target_backup.gz" --gzip
```

### 2.3 Backup Integrity Verification
Backups must be tested monthly in an isolated staging environment:
1. Spin up clean staging MongoDB container.
2. Run `mongorestore`.
3. Execute `npm run test:all` against restored instance to verify data integrity.

---

## 3. Microservice Failover & Circuit Breaking

### 3.1 AI Service (`ai-service`) Disruption
- The Express backend interacts with the Python microservice through a timeout-guarded proxy (`AbortController` set to 8,000ms).
- If the AI microservice becomes unavailable or crashes, the backend gracefully catches the error and returns:
  `HTTP 503 Service Unavailable: "Clinical AI Service is currently unavailable. Please proceed with standard clinical evaluation."`
- The core platform (Appointments, Follow-up plans, Triage alerts) continues functioning without interruption.

---

## 4. Operational Incident Runbook

### 4.1 Unhandled Medical Triage Alerts
- When a patient recovery check-in triggers `hasWarningSymptoms: true` or `clinicianReview.status: 'NEEDS_ATTENTION'`, an immediate notification is scheduled for the treating doctor.
- If unreviewed after 4 hours, secondary alert escalates to hospital management duty triage.

### 4.2 Security Compromise / Key Rotation
If `JWT_SECRET` is compromised:
1. Update `JWT_SECRET` in environment variables.
2. Restart backend instances (`npm run start` or `docker compose restart server`).
3. All existing tokens are instantly invalidated, requiring re-authentication.

---

## 5. Regulatory Demonstration Notice
**SwasthyaCare is an academic and agile software demonstration platform.**
It is NOT certified as Software as a Medical Device (SaMD) under FDA / CE / CDSCO regulations and must not be used for autonomous clinical diagnosis or unmonitored prescription alterations.
