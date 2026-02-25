# Lev Learn Letters - Synology Docker Setup

## 1. Build the Image
1. Upload the project files to your Synology NAS (e.g., via File Station to a folder like `/docker/lev-learn-letters`).
2. Open **Synology Container Manager** (or Docker).
3. Go to **Image** -> **Build**.
4. Select the folder where you uploaded the files (containing the `Dockerfile`).
5. Name the image: `lev-learn-letters:latest`.
6. Click **Build** and wait for it to complete.

## 2. Create the Container
1. Go to **Container** -> **Create**.
2. Select the image you just built (`lev-learn-letters:latest`).
3. Click **Next**.

## 3. Port Settings
1. In the Port Settings section, add a new rule:
   - **Local Port**: `3005`
   - **Container Port**: `3000`
   - **Type**: `TCP`
2. This ensures the app runs on port 3005 as requested.

## 4. Volume Settings (Crucial for Saving Progress)
To ensure your child's progress is saved permanently (SQLite database), you must map a volume.
1. In the Volume Settings section, add a folder:
   - **File/Folder**: Select a folder on your NAS (e.g., `/docker/lev-learn-letters/data`). Create it if it doesn't exist.
   - **Mount Path**: `/app/data`
   - **Type**: `Read/Write`

## 5. Finalize
1. Click **Next** and then **Done**.
2. The container should start automatically.
3. Open your browser and go to `http://YOUR_NAS_IP:3005`.

## Troubleshooting
- If the container stops immediately, check the logs in Container Manager.
- Ensure the mapped folder has write permissions for the Docker user (usually standard on Synology).
