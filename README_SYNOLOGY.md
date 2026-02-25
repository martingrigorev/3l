# Lev Learn Letters - Synology Docker Setup

## Option 1: Using Docker Compose (Recommended)

This is the easiest way to run the project on Synology using **Container Manager** (formerly Docker).

1.  **Prepare Files**:
    *   Create a folder on your Synology NAS (e.g., `/docker/lev-learn-letters`).
    *   Upload all project files to this folder, including `docker-compose.yml` and `Dockerfile`.
    *   Create a `data` subfolder inside it (e.g., `/docker/lev-learn-letters/data`) to store the database.

2.  **Create Project**:
    *   Open **Synology Container Manager**.
    *   Go to **Project** -> **Create**.
    *   **Project Name**: `lev-learn-letters`.
    *   **Path**: Select the folder where you uploaded the files (`/docker/lev-learn-letters`).
    *   **Source**: Select "Create docker-compose.yml" (if you haven't uploaded it) OR "Use existing docker-compose.yml" (if you uploaded the file I provided).

3.  **Run**:
    *   Click **Next** / **Done**.
    *   The project will build the image and start the container automatically.
    *   The app will be available at `http://YOUR_NAS_IP:3005`.

## Option 2: Manual Image Build (Legacy Method)

## 1. Build the Image
1. Upload the project files to your Synology NAS.
2. Open **Synology Container Manager**.
3. Go to **Image** -> **Build**.
4. Select the folder containing the `Dockerfile`.
5. Name the image: `lev-learn-letters:latest`.
6. Click **Build**.

## 2. Create the Container
1. Go to **Container** -> **Create**.
2. Select the image `lev-learn-letters:latest`.

## 3. Port Settings
1. Map **Local Port** `3005` to **Container Port** `3000` (TCP).

## 4. Volume Settings (Crucial)
1. Map a folder on your NAS (e.g., `/docker/lev-learn-letters/data`) to `/app/data` (Read/Write).

## 5. Finalize
1. Click **Done**.
2. Open `http://YOUR_NAS_IP:3005`.
