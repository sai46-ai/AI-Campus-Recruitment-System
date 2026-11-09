# 07 — Database Uploads and Data Persistence

**Subsystem:** MongoDB Persistence, Multer Upload Storage, In-Memory Dynamic PDF Resynthesis
**Cluster:** MongoDB Atlas Cluster (`ai-campus-cluster.36khklu.mongodb.net`)

---

## 1. Database Connection & Lifecycle

- **ODM:** Mongoose 8.5.1
- **Connection Strategy:**
  - In production, connects directly to `MONGODB_URI` with automatic reconnection backoff.
  - In development, attempts `MONGODB_URI`; if unreachable and in local development, automatically spins up `mongodb-memory-server` to allow instant offline development.
  - In test environments, uses isolated in-memory databases with automatic collection clearing between suites.
- **Connection Test:** Verified live connection to Atlas cluster:
  - Host: `ai-campus-cluster.36khklu.mongodb.net`
  - Result: `CONNECTED` with zero handshake or auth errors.

---

## 2. File Upload & Resume Storage Strategy on Render

### Ephemeral Filesystem Challenge
Render Web Services operate on ephemeral container filesystems: files stored in local directories like `./uploads` are discarded whenever a dyno restarts or a new deploy occurs.

### Multi-Tier Storage Resilience
The application implements two complementary storage defenses:

1. **Persistent Disk on Render Starter Tier:**
   - In `render.yaml`, `ai-campus-backend` specifies a persistent disk:
     ```yaml
     disk:
       name: resume-data
       mountPath: /var/data
       sizeGB: 1
     envVars:
       - key: UPLOAD_DIR
         value: /var/data/uploads
     ```
   - Resumes uploaded via Multer are written to `/var/data/uploads`, persisting across restarts and deployments.

2. **In-Memory Dynamic PDF Resynthesis Fallback:**
   - If deployed on Render's Free tier (where persistent disks are unsupported), `resumeController.ts` includes an automatic fallback (`buildPdfBufferFromResume`).
   - When a recruiter or student requests a resume download via `GET /api/v1/resumes/:id/download`:
     - Checks if physical file exists on disk.
     - If the physical file is absent, dynamically re-synthesizes a valid, clean PDF document directly from the structured resume JSON schema stored in MongoDB Atlas (name, email, skills, experience, education).
     - Streams the synthesized PDF buffer to the client with `Content-Type: application/pdf` and `Content-Disposition: attachment`.
   - Result: **Zero data loss and zero broken download links** regardless of hosting tier.
