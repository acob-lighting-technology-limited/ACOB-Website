# Sanity Content & Image Management Best Practices

This document outlines the standard workflow and guidelines for managing images, media, and document fields on the ACOB website CMS (Sanity.io). Following these rules ensures peak website performance, fast loading speeds for mobile users, clean backups, and strong search engine optimization (SEO).

---

## 1. Image Format & Optimization Standard

### WebP is Mandatory

- **Always convert images to WebP** before publishing.
- **Why**: WebP offers 30% to 80% smaller file sizes than JPEGs or PNGs with zero noticeable difference in visual quality.
- **Maximum Resolution**: Limit images to a maximum width or height of **1200px** unless a specific layout requires raw full-resolution (e.g., high-quality banners).

---

## 2. File Naming Conventions (SEO & Searchability)

Before uploading any image or media asset to Sanity, rename it to a descriptive, content-relevant title.

- **Rules**:
  1. Use only **lowercase** letters.
  2. Separate words with **hyphens** (not spaces, underscores, or special characters).
  3. Prefix with `acob-` for company assets.
- **Bad**: `photo_2026-07-15_08-06-42.jpg`, `Untitled 2.png`, `IMG_8271.WEBP`
- **Good**: `acob-village-solar-grid-installation.webp`, `acob-democracy-day-greeting.webp`, `acob-ceo-nasarawa-summit.webp`

---

## 3. Alternative (Alt) Text Policy (SEO & Accessibility)

- **Alt text is mandatory** on all image fields. The Sanity Studio schemas enforce this validation, meaning you cannot publish a post or project with empty `alt` text.
- **Writing Guidelines**:
  - Keep it descriptive and natural (e.g., _"Alexander Obiechina signing the partnership agreement with NASIDA"_).
  - Do not stuff keywords. Describe the actual contents of the visual.

---

## 4. Document Slugs (URL Paths)

- **Consistency**: Slugs must be entirely **lowercase**, separating words with hyphens (e.g. `/updates/happy-new-month-hello-july-2026`).
- Avoid using punctuation, parentheses, or capital letters in slugs, as they can cause broken links and complicate web server routing.

---

## 5. Database Cleanup & Housekeeping

When images are replaced or deleted in posts, they remain inside Sanity as "orphaned assets" (consuming storage quota).

- **Cleanup Routine**: Run the database cleanup script periodically to remove orphaned assets:
  ```bash
  npx tsx scripts/clean-orphaned-assets.ts
  ```
  _Note: The script automatically downloads copies of deleted assets to `.image-backups/orphans/` as a local backup before removing them from the cloud._
