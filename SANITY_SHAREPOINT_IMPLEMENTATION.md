# Sanity to SharePoint Backup Implementation

## Overview

This document describes the SharePoint backup implementation added to `ACOB-Website`.

The website remains **Sanity-first** for content editing and asset storage. Editors continue uploading images, videos, and files directly inside Sanity Studio. A server-side integration then copies supported assets into a SharePoint document library as a backup/archive.

The SharePoint target currently uses the `website` document library inside:

- Site hostname: `acoblightingltd.sharepoint.com`
- Site path: `/sites/department-documents`
- Library name: `website`

## Goal

The goal of this implementation is:

- Keep the normal Sanity editor workflow unchanged
- Automatically back up supported Sanity media to SharePoint
- Backfill already-existing content into SharePoint
- Keep SharePoint folders human-readable using content type, year, slug, and date

## What Was Implemented

### 1. Microsoft Graph / SharePoint client

Added:

- `lib/sharepoint/onedrive.ts`

This service handles:

- Azure app authentication using client credentials
- Microsoft Graph access token retrieval
- SharePoint site / drive resolution
- Folder creation in the target SharePoint library
- File upload into SharePoint

The service uses:

- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `ONEDRIVE_SITE_ID` or `ONEDRIVE_SITE_HOSTNAME` + `ONEDRIVE_SITE_PATH`
- `ONEDRIVE_DRIVE_ID` or `ONEDRIVE_DRIVE_NAME`

### 2. Sanity asset backup service

Added:

- `lib/sharepoint/sanity-backup.ts`

This service handles:

- fetching the latest published Sanity document
- resolving all supported media assets from the document
- computing the SharePoint folder path
- downloading the original Sanity asset binary
- uploading that binary to SharePoint
- patching backup status back into Sanity

### 3. Sanity publish webhook endpoint

Added:

- `app/api/sanity/sharepoint-backup/route.ts`

This route is the publish/update sync trigger.

Sanity webhook sends a request with:

- `_id`
- `_type`

The route verifies the secret and then runs the backup flow for the target document.

### 4. Backfill endpoint for existing content

Added:

- `app/api/sanity/sharepoint-backfill/route.ts`

This route is used to:

- preview which documents are pending backup
- backfill already-existing content
- force a resync for already-synced documents

Supported query params include:

- `type=project`
- `type=product`
- `type=updatePost`
- `limit=...`
- `force=true`

### 5. Backup status fields in Sanity schemas

Added read-only `sharepointBackup` fields to:

- `sanity/schemaTypes/project.ts`
- `sanity/schemaTypes/product.ts`
- `sanity/schemaTypes/updatePost.ts`

These fields show:

- status
- last synced time
- folder path
- asset count
- last error

## Supported Content Types

The implementation currently supports:

- `project`
- `product`
- `updatePost`

## Supported Media Per Content Type

### Project

Backed up:

- `projectImage`
- legacy `content[]` images
- `projectContent.images[]` images
- `projectContent.images[]` videos

Current SharePoint file naming inside each project folder:

- `main-image.*`
- `content-image-1.*`, `content-image-2.*`, ...
- `gallery-image-1.*`, `gallery-image-2.*`, ...
- `gallery-video-1.*`, `gallery-video-2.*`, ...

### Product

Backed up:

- `media.productImage`
- `media.productImages[]` images
- `media.productImages[]` videos
- `media.datasheet`

Current file naming:

- `main-image.*`
- `gallery-image-1.*`, `gallery-image-2.*`, ...
- `gallery-video-1.*`, `gallery-video-2.*`, ...
- `datasheet.pdf`

### Update Post

Backed up:

- `featuredImage`
- `content[]` images
- `content[]` videos

Current file naming:

- `featured-image.*`
- `content-image-1.*`, `content-image-2.*`, ...
- `video-1.*`, `video-2.*`, ...

## Folder Structure in SharePoint

Folders are created inside the `website` document library.

Structure:

- `project/<year>/<slug-dd-mm-yyyy>`
- `product/<year>/<slug>`
- `update/<year>/<slug-dd-mm-yyyy>`

Examples:

- `project/2024/keffi-nassarawa-hospital-survey-24-06-2024`
- `project/2025/orotedo-community-40-kwp-hybrid-solar-mini-grid-project-for-rural-electrification-ondo-state-29-12-2025`
- `product/2025/premium-monocrystalline-solar-panel-550w`
- `update/2026/powering-communities-on-the-international-day-of-clean-energy-26-01-2026`

### Date logic

- `project` year/date comes from `projectDate`, fallback `_createdAt`
- `updatePost` year/date comes from `publishedAt`, fallback `_createdAt`
- `product` year comes from `_createdAt`
- `product` currently does not append a date suffix unless explicit date logic is later added

## Asset Quality

The SharePoint backup stores the **original Sanity asset binary**, not a website-optimized derivative.

This means:

- no resize is applied during backup
- no compression/quality parameter is applied during backup
- the backed-up file quality matches the file stored in Sanity

## Environment Variables Used

The website requires these values for the SharePoint backup flow:

- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `ONEDRIVE_ENABLED=true`
- `ONEDRIVE_SITE_ID`
- `ONEDRIVE_SITE_HOSTNAME=acoblightingltd.sharepoint.com`
- `ONEDRIVE_SITE_PATH=/sites/department-documents`
- `ONEDRIVE_DRIVE_NAME=website`
- `SHAREPOINT_WEBSITE_ROOT_FOLDER=/`
- `SANITY_WEBHOOK_SECRET`
- `SANITY_API_TOKEN`

## Webhook Configuration

Sanity webhook should point to:

- `https://www.acoblighting.com/api/sanity/sharepoint-backup`

Recommended settings:

- Method: `POST`
- Dataset: `production`
- Filter:

```groq
_type in ["project", "product", "updatePost"]
```

- Projection:

```json
{
  "_id": _id,
  "_type": _type
}
```

- Authorization header:

```text
Authorization: Bearer <SANITY_WEBHOOK_SECRET>
```

## Backfill Work Completed

A full backfill of existing supported content was run successfully.

Completed:

- `project`: all existing project documents synced
- `product`: all existing product documents synced
- `updatePost`: all existing update documents synced

Notes from the run:

- project folders now contain full gallery media after the project gallery fix
- one product reported `uploadedCount: 0`, which likely means that document currently has no resolvable media asset attached in Sanity

## Current Behavior for Renames

### Current production behavior

At the time of this document:

- a renamed document will sync into the new computed folder path on the next publish
- an old SharePoint folder may remain behind if the document was already synced under its old name

### Rename/move enhancement

Work was started locally to support SharePoint folder moves on rename by:

- reading the previous `sharepointBackup.folderPath` from Sanity
- comparing it with the newly computed folder path
- moving the existing SharePoint folder before uploading new files

This rename/move enhancement was **not finalized and deployed as part of the documented stable flow** unless separately reviewed and released.

## Current Limitation

This implementation backs up **assets attached to supported Sanity documents**.

It does **not** mirror every asset ever uploaded to Sanity globally.

That means:

- if a file is attached to a `project`, `product`, or `updatePost`, it is supported
- if a file exists in Sanity asset storage but is not referenced by one of those document fields, it will not be copied



## Files Added / Updated

Primary implementation files:

- `app/api/sanity/sharepoint-backup/route.ts`
- `app/api/sanity/sharepoint-backfill/route.ts`
- `lib/sharepoint/onedrive.ts`
- `lib/sharepoint/sanity-backup.ts`
- `sanity/schemaTypes/project.ts`
- `sanity/schemaTypes/product.ts`
- `sanity/schemaTypes/updatePost.ts`
- `env.example`


