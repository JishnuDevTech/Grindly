# Implementation Notes

- The current experience uses mock data from `src/data/mockData.js`.
- Completing a quest updates the local React state and displays a reward animation.
- Onboarding completion is stored in browser local storage under `grindly_onboarding_complete`.
- Navigation is intentionally local state for this phase; there is no router dependency.
- Backend API integration should replace mock data without changing the reusable component contracts where possible.
