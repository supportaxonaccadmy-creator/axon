# Enterprise LMS Service Layer Documentation

## Overview

The LMS service layer provides the complete business logic for the Student Portal and Admin CMS. It is organized into services, integrity validators, search, performance utilities, and helpers.

## Architecture

```
src/services/lms/
├── base/                    # BaseLmsService abstract class
├── integrity/               # Data integrity engine
├── batchService.ts          # Batch CRUD
├── subjectService.ts        # Subject CRUD
├── chapterService.ts        # Chapter CRUD
├── classService.ts          # Class CRUD
├── videoService.ts          # Video CRUD
├── pdfService.ts            # PDF Notes CRUD
├── mcqService.ts            # MCQ Sets & Questions CRUD
├── attachmentService.ts     # Attachments CRUD
├── pricingService.ts        # Batch Pricing CRUD
├── purchaseService.ts       # Purchases CRUD
├── enrollmentService.ts     # Enrollments + business logic
├── hierarchyService.ts      # Tree & breadcrumb builder
├── searchService.ts         # Basic global search
├── enhancedSearchService.ts # Enhanced search with ranking/highlight
├── statisticsService.ts     # Aggregation & counts
├── validationService.ts     # Pure validation (no DB)
├── transactionService.ts    # Hierarchy transactions with rollback
├── performanceOptimizer.ts  # Cache, memoization, lazy loading
└── index.ts                 # Barrel exports
```

## Hierarchy

The LMS uses a 4-level hierarchy: **Batch → Subject → Chapter → Class**.

Content (Videos, PDFs, MCQs, Attachments) attaches to Classes.

### Hierarchy Service

- `getBatchTree(batchId, publishedOnly)` — Full tree from batch down to classes
- `getSubjectTree(subjectId, publishedOnly)` — Tree from subject down to classes
- `getChapterTree(chapterId, publishedOnly)` — Tree from chapter down to classes
- `getFullHierarchy(publishedOnly)` — Entire hierarchy across all batches
- `flattenHierarchy(nodes)` — Convert tree to flat list
- `buildBreadcrumb(type, id)` — Build breadcrumb trail from any level up to batch
- `getParents(type, id)` — Get parent chain (breadcrumb minus self)
- `getChildren(type, id, publishedOnly)` — Get direct children of any node

### Transaction Service

- `createHierarchy(input)` — Creates batch + subjects + chapters + classes atomically with rollback
- `deleteHierarchy(batchId)` — Deletes batch (cascades via DB constraints)
- `publishHierarchy(batchId)` — Publishes entire batch tree
- `archiveHierarchy(batchId)` — Archives entire batch tree

## Services

All CRUD services follow the same pattern:
- `getById(id)` — Fetch by UUID
- `getBySlug(slug)` — Fetch by slug
- `list(options)` — List with filtering, sorting, search
- `paginate(page, pageSize, options)` — Paginated list with total count
- `create(input)` — Insert with automatic row mapping
- `update(id, input)` — Partial update
- `remove(id)` — Delete
- `count(filters)` — Count records
- `exists(id)` — Check existence

### Enrollment Service

Additional business logic:
- `isStudentEnrolled(profileId, batchId)` — Active enrollment check
- `getAccessibleBatches(profileId)` — Active, non-expired enrollments
- `enrollStudent(profileId, batchId, pricingId)` — Auto-computes expiry from pricing
- `purchaseBatch(...)` — Composite: creates purchase + enrollment
- `cancelEnrollment(id)` / `expireEnrollment(id)` / `activateEnrollment(id)`

### Pricing Service

- `getByBatchId(batchId)` — 1:1 pricing lookup
- Supports free batches, sale prices, lifetime access, and duration-based access

## Validation

### Validation Service (Synchronous)

Pure validation with no DB access. Returns `{ valid, errors[], fieldErrors }`.

Validators: `validateBatch`, `validateSubject`, `validateChapter`, `validateClass`, `validateVideo`, `validatePdf`, `validateMcqSet`, `validateMcqQuestion`, `validatePricing`, `validatePurchase`, `validateEnrollment`

### Validation Engine (Schema-based)

```typescript
import { validationEngine } from '@/lib/validation';

const schema = {
  title: { type: 'string', required: true, minLength: 2, maxLength:  200 },
  slug: { type: 'slug', required: true, maxLength: 150 },
  email: { type: 'email', required: false },
};

const report = validationEngine.validate(data, schema);
```

Supported field types: `string`, `number`, `integer`, `boolean`, `email`, `phone`, `uuid`, `slug`, `url`, `enum`, `decimal`

## Data Integrity Engine

Located in `src/services/lms/integrity/`. Provides comprehensive integrity checks.

### Validators

- **hierarchyValidator** — Validates batch→subject→chapter→class parent-child relationships
- **relationshipValidator** — Checks all foreign key references across 13 relationship pairs
- **enrollmentValidator** — Validates enrollment references, expiry status, purchase linkage
- **purchaseValidator** — Validates purchase references, amounts, transaction references
- **pricingValidator** — Validates pricing references, sale price logic, free batch consistency
- **duplicateDetector** — Detects duplicate slugs and duplicate pricing per batch
- **missingReferenceDetector** — Finds records with missing or broken foreign keys
- **brokenHierarchyDetector** — Detects orphaned content with broken parent references

### Integrity Engine

```typescript
import { integrityEngine } from '@/services/lms/integrity';

const report = await integrityEngine.runFullIntegrityCheck();
// Returns: { hierarchy, relationships, enrollments, purchases, pricing, duplicates, missingReferences, brokenHierarchy, overall }
```

## Search

### Basic Search Service

- `search(query, options)` — Searches across 7 entity types
- `paginateSearch(query, page, pageSize, options)` — Paginated search

### Enhanced Search Service

- Relevance scoring and ranking
- Result highlighting with `<mark>` tags
- Snippet extraction
- Published-only mode (for students)
- Admin mode (includes drafts)
- Scope filtering by batch/subject/chapter/class
- `searchInBatch(query, batchId)` — Scoped search within a batch

## Performance Optimization

### Performance Optimizer

- `getCachedBatchTree(batchId)` — Memoized batch tree with 10-minute TTL
- `getCachedFullHierarchy()` — Memoized full hierarchy
- `getCachedCount(table, filters)` — Cached count queries
- `batchFetch(table, ids)` — Batch fetch by IDs
- `parallelFetch(promises)` — Promise.all wrapper
- `invalidateHierarchyCache()` / `invalidateStatsCache()` — Cache invalidation
- `createLazyLoader(factory)` — Lazy loading helper

### Cache Layer

- Memory-based cache with TTL
- Pattern-based invalidation
- `getOrSet` pattern for cache-aside
- Automatic cleanup of expired entries

## Purchase Flow

1. Student selects a batch
2. Pricing is fetched via `pricingService.getByBatchId(batchId)`
3. `enrollmentService.purchaseBatch(profileId, batchId, pricingId, pricing)` is called
4. A purchase record is created in the `purchases` table
5. An enrollment record is created with computed expiry date
6. If pricing is free, enrollment type is 'free'; otherwise 'purchase'
7. Access duration is calculated from pricing configuration

## Enrollment Flow

1. After purchase, enrollment is active
2. `enrollmentService.isStudentEnrolled(profileId, batchId)` checks access
3. `enrollmentService.getAccessibleBatches(profileId)` returns all active batches
4. Expiry is automatically computed from pricing's `accessDurationDays`
5. Lifetime access means no expiry date
6. Cancelled/expired enrollments are excluded from access checks
