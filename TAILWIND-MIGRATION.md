# Tailwind CSS and Shadcn/UI Migration

This document outlines the migration from Bulma to Tailwind CSS 4 with Shadcn/UI components in the Historical Geocoding Assistant application.

## Current Status

- ✅ Bulma has been removed entirely
- ✅ Tailwind CSS 4 has been integrated with Shadcn/UI components
- ✅ Basic components (Button, Checkbox, Input, Switch, Slider) have been implemented
- ⏳ React components need to be updated to use new Shadcn/UI components

## Migration Steps

### Phase 1: Foundation (Completed)

- [x] Install Tailwind CSS 4 and its dependencies
- [x] Configure Tailwind CSS with Vite
- [x] Add basic Tailwind styles to index.html for testing
- [x] Ensure build process works with Tailwind CSS

### Phase 2: Component Migration (Completed)

- [x] Create Shadcn/UI versions of key components:
  - [x] Button
  - [x] Checkbox
  - [x] Input
  - [x] Switch
  - [x] Slider
- [x] Remove Bulma and related dependencies
- [x] Remove Bulma components directory

### Phase 3: Implementation (In Progress)

- [ ] Update existing React components to use the new Shadcn/UI components
- [ ] Refactor CSS classes across the application to use Tailwind utilities
- [ ] Remove any remaining Bulma class references
- [ ] Test the application thoroughly to ensure consistent styling

## Common Mapping from Bulma to Tailwind

### Colors

| Bulma      | Tailwind                |
| ---------- | ----------------------- |
| is-primary | text-primary bg-primary |
| is-danger  | bg-danger text-white    |
| is-dimmed  | text-dimmed             |

### Typography

| Bulma             | Tailwind    |
| ----------------- | ----------- |
| is-size-1         | text-5xl    |
| is-size-3         | text-3xl    |
| has-text-centered | text-center |

### Layout

| Bulma     | Tailwind          |
| --------- | ----------------- |
| container | container mx-auto |
| columns   | flex              |
| column    | flex-1            |
| is-flex   | flex              |

## Notes

- All Bulma dependencies have been removed from package.json
- The app/bulma directory has been removed
- New components should be built with Shadcn/UI and Tailwind CSS
- The shadcn/ui components are accessible from app/components/ui
- Custom styling can be added through Tailwind's utility classes or by extending the theme in tailwind.config.js

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/UI Documentation](https://ui.shadcn.com/docs)
- [Tailwind CSS with Vite](https://tailwindcss.com/docs/guides/vite)
