# Archon Migration Blueprint: Exporting and Importing to a New Machine

This blueprint outlines the exact, step-by-step process for securely migrating the Archon project to a new machine using GitHub for version control and Google Drive for database/storage transfers.

## Phase 1: Exporting from the Source Machine

**Objective:** Cleanly shut down services, ensure all code is pushed to GitHub, and create compressed backups of your Supabase database and storage volumes.

### Step 1: Push Codebase to GitHub

Ensure your local branch is up to date and push all changes.
_Note: We have already confirmed your codebase matches your running containers perfectly._

```bash
cd /home/lnx-ubuntu-wsl/LeonAI_DO/dev/MCP-Servers/servers/archon
git add .
git commit -m "chore: push archon codebase for migration"
git push origin main
```

### Step 2: Stop All Running Containers

Before exporting the volumes, you must stop the services to prevent data corruption or partial writes.

```bash
docker compose down
supabase stop
```

### Step 3: Export Supabase Volumes to Tarballs

Your application relies on two critical Docker volumes for state: `supabase_db_archon` (database) and `supabase_storage_archon` (uploaded files/assets).

Run the following commands to spin up temporary Alpine Linux containers that will mount the volumes and compress their contents into your current directory.

```bash
# Export the Database volume
docker run --rm \
  -v supabase_db_archon:/volume \
  -v $(pwd):/backup \
  alpine tar -cvzf /backup/archon-db-backup.tar.gz -C /volume ./

# Export the Storage volume
docker run --rm \
  -v supabase_storage_archon:/volume \
  -v $(pwd):/backup \
  alpine tar -cvzf /backup/archon-storage-backup.tar.gz -C /volume ./
```

### Step 4: Upload Backups to Google Drive

You should now have two new files in your project directory:

- `archon-db-backup.tar.gz`
- `archon-storage-backup.tar.gz`

1. Open your web browser and navigate to **Google Drive**.
2. Upload _both_ `.tar.gz` files to a secure folder in your Drive.
3. Once uploaded, you may delete the local `.tar.gz` files if you wish to save disk space.

---

## Phase 2: Importing and Rebuilding on the Target Machine

**Objective:** Clone the codebase, download your data backups, restore the Docker volumes, and rebuild the application environment.

### Prerequisites (On Target Machine)

Make sure the target machine has the following installed:

- **Git**
- **Docker & Docker Compose**
- **Supabase CLI** (Required for `supabase start`)

### Step 1: Clone the Repository

Retrieve your latest codebase from GitHub.

```bash
cd ~/path/to/your/projects
git clone <YOUR_GITHUB_REPO_URL>
cd archon
```

### Step 2: Download the Data Backups

1. Open your web browser and navigate to **Google Drive**.
2. Download both `archon-db-backup.tar.gz` and `archon-storage-backup.tar.gz`.
3. Move these two files into the root directory of your cloned `archon` project (`cd archon`).

### Step 3: Recreate Docker Volumes

Before we can unpack the data, we must explicitly create the empty Docker volumes so Docker knows where to store the data.

```bash
docker volume create supabase_db_archon
docker volume create supabase_storage_archon
```

### Step 4: Restore the Data into the Volumes

We will use the reverse of the Alpine container trick from Phase 1. This mounts the empty volumes and extracts the `.tar.gz` archives inside them.

```bash
# Restore the Database volume
docker run --rm \
  -v supabase_db_archon:/volume \
  -v $(pwd):/backup \
  alpine sh -c "cd /volume && tar -xvzf /backup/archon-db-backup.tar.gz"

# Restore the Storage volume
docker run --rm \
  -v supabase_storage_archon:/volume \
  -v $(pwd):/backup \
  alpine sh -c "cd /volume && tar -xvzf /backup/archon-storage-backup.tar.gz"
```

_Note: Once restored successfully, you can delete the `.tar.gz` files to save space._

### Step 5: Start the Environment & Build Images

Now that the code is present and the databases hold your historical data, you can build and start the containers.

```bash
# First, start Supabase (this links to the volumes we just restored)
supabase start

# Next, build and start the Archon application stack (Server, UI, MCP)
docker compose up -d --build
```

_Note: The `--build` flag forces Docker to rebuild your images based on the `Dockerfiles` present in your repository, guaranteeing a fresh, reproducible environment._

### Step 6: Verify the Setup

Run `docker ps` to verify all containers are healthy. You should now be able to access the Archon UI and see all of your pre-existing data exactly as it was on the primary machine.
