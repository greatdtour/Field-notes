# Product Requirements Document (PRD)
~~# Blog Managise - Media-Driven Travel Experience Platform~~
# GDT Field Notes - Media-Driven Travel Essay Platform

## Overview
~~Blog Managise is a media-driven travel experience platform where users share travel stories using photos, videos, and written narratives. Any user can submit posts. An admin reviews and either approves, rejects, or requests modifications through comments. Admins can also post as regular users. The public blog must be visually attractive and centered on rich media.~~
GDT Field Notes is a media-driven travel essay platform where users share travel stories using photos, videos, and written narratives. Any user can submit essays. An admin reviews and either approves, rejects, or requests modifications through comments. Admins can also post as regular users. The public blog must be visually attractive and centered on rich media.

## Goals
- Enable easy creation and submission of media-rich travel posts.
- Provide an efficient moderation workflow for admins.
- Deliver a visually compelling, media-first public blog experience.

## Target Users
- Travelers who want to share trip stories with photos and videos.
- Readers who want to discover authentic travel experiences.
- Admins who moderate submissions and maintain quality.

## Success Metrics
- Submission to approval time < 24 hours (median).
- Post engagement (likes, comments, shares) trends upward over 8 weeks.
- 90% of posts include at least 1 media asset.

## Scope
### In Scope
- User registration and login.
~~- Create/edit travel posts with media (photos and videos) and text.~~
- Create/edit travel essays with media (photos and videos) and text.
- Post submission flow with status: Draft -> Pending -> Approved/Rejected/Needs Changes.
- Admin moderation dashboard with approve/reject/request changes.
- Public blog with rich media layout and discoverability.
- Subscribe form to collect email addresses and a checkbox for users interested in submitting write-ups (subject to admin review).
- Partner interest form for vendors to express partnership intent.

### Out of Scope (Phase 1)
- Monetization, ads, or paid subscriptions.
- Advanced social graph (followers, DMs).
- AI-generated content.

## User Stories
~~- As a user, I can create a travel post with photos, videos, and text.~~
- As a user, I can create a travel essay with photos, videos, and text.
- As a user, I can submit a post for admin review.
- As a user, I can receive admin comments requesting changes and update my post.
- As an admin, I can approve, reject, or request modifications for any post.
- As an admin, I can post content like a regular user.
- As a visitor, I can browse a visually appealing feed of approved posts.
- As a visitor, I can see essay metadata like read time, author, and engagement actions.

## Functional Requirements
### Content Creation
- Rich text editor with support for headings, lists, quotes, and links.
- Upload multiple photos and videos per post.
- Media preview and reorder capabilities before submission.
- Auto-save drafts.
- SEO-ready essay editor elements (H1/H2/H3, paragraphs, tags, meta description, media alt text, and basic schema-ready fields).

### Submission and Moderation
- Post statuses: Draft, Pending Review, Approved, Rejected, Needs Changes.
- Admin comments attached to posts when requesting modifications or rejecting.
- Users can edit and resubmit posts after changes requested.
- Admin actions logged for audit.

### Public Blog Experience
- Media-first layout with large visuals, immersive cover sections, and story blocks.
~~- Post detail page with a mixed media narrative (photo, video, text blocks).~~
- Essay detail page with a mixed media narrative (photo, video, text blocks).
- Search and filters (location, tags, time period).
- Responsive and mobile-first design.
- Essay metadata displayed client-side: read time, posted by, likes, share, comment.
- Multiple categories per essay in Field Notes.

## Admin Requirements
- Moderation dashboard with filterable list of pending posts.
- Inline preview of content and media.
- Approve, reject, or request changes with comments.
- Admin can create and publish posts directly.
- Admin can edit every page section and layout using drag-and-drop components, including adding/reordering/removing blocks.

## Non-Functional Requirements
- Performance: Optimize media loading with lazy loading and responsive sizes.
- Security: Role-based access control for admin features.
- Reliability: Media upload validation, virus scanning or file type checks.
- Scalability: Support increasing media storage and traffic.

## Data Model (High-Level)
- User: id, name, email, role (user/admin)
- Post: id, author_id, title, content, status, created_at, updated_at
- Media: id, post_id, type (photo/video), url, order
- Comment (admin feedback): id, post_id, admin_id, text, created_at
- Tags: id, name
- Post_Tags: post_id, tag_id

## Database (Dev Connection)
- Host: localhost
- Port: 5431
- DB: postgres
- User: postgres
- Password: 1

## UX/UI Requirements
- Strong visual identity with large imagery, full-bleed sections, and curated spacing.
- Emphasis on media with minimal distractions.
- Smooth transitions between media blocks.
- Accessible typography and readable text overlays.
- Page sections: Home, Featured Essays, Field Notes (categorized), About Us, Subscribe, Partner Interest, Footer.

## Open Questions
- Should users be able to comment on posts publicly?
- Is there a maximum media size or count per post?
- Do we need multi-language support?

## MVP Checklist
- User auth
- Post creation with media upload
- Moderation dashboard
- Public feed of approved posts
- Post detail page with rich media layout

## Planned Enhancements
- Inline media picker inside the essay block editor (image/video per media block).
- In-app notifications with badge + panel for admin comments.
