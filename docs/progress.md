# SDD ledger — plan: docs/superpowers/plans/2026-10-30-bauplaninvest.md
Execution: inline, approved by user. Existing cloud checkout is isolated; feature branch used, no additional worktree.
Pre-flight: Task 1→2 GLB named groups match sequence groups; Task 2→3 self-contained Sequence; Task 3→4 company config supplies metadata.
Ruling: use this isolated cloud checkout and feature branch instead of another worktree — preserves onboarding instruction and existing assets — no additional filesystem isolation.
Task 1 in progress: authored Blender scene and six-phase GLB (1.1 MB). First render exposed Blender build missing OIDN; use supported non-denoised Cycles rendering at 96 samples. No integrity checks disabled.
Task 2 RED: sequence.test.ts failed for missing sequence module. GREEN: pure deterministic phase function implemented; 2 tests pass, including backwards seeking and invalid times.
Task 1 visual inspection: original 1920×1200 render and first desktop/mobile screenshots reviewed. Architecture is coherent and detailed but remains a conceptual visualization, not photorealistic client project photography. Refinement planned for glazing, roof and landscape before page expansion.
Ruling: use installed Chromium because cdn.playwright.dev is forbidden by active network policy — do not bypass or broaden network permissions — Firefox/Safari coverage remains unavailable here.
Task 1: model, two authored renders, responsive hero, local Cyrillic fonts and original logo implemented; visual inspection performed. OIDN absence resolved by supported Cycles CPU rendering. Additional glazing/light refinement running.
Task 3 RED: 3 route/browser checks failed on absent pages; implemented all required routes, truthful content, central company configuration and menu.
Task 4 build: production compilation and prerendering passed. Dev Turbopack HMR WebSocket unavailable; production hydration confirmed via mobile menu (MENU true), Webpack dev mode selected for separate validation.
Ruling: conceptual render is not claimed as Apple-level photorealism or native 4K imagery — document premium visual refinement as a launch limitation — further art production needed if client requires reference-level realism.
Task 2 diagnosis: glTF multi-material nodes become Group parents with differently named Mesh children. Added a real GLTFLoader test; RED: missing phase for Cube001. GREEN: resolve phase by nearest named ancestor; all six phase types covered. Playback delta no longer capped, preserving 15-second wall-clock duration on slow frames.
Task 4 browser baseline: 7/8 passed after production isolation. Remaining sequence timing failure diagnosed above. Reduced motion, mobile menu/Escape/focus, routes/404, server content with JS disabled, contacts and model-load fallback all passed.
Task 4 diagnosis completed: Next.js 16.4 blocks HMR Origin 127.0.0.1 when bound to 0.0.0.0 unless explicitly allowed. Raw handshake returned Unauthorized; official allowedDevOrigins: ['127.0.0.1'] fixed it. Browser menu now reports MENU true in dev; prior suspicion of an environment-level WebSocket limitation is superseded. No origin checks disabled.
Task 4 dependency audit: npm audit --omit=dev reported 0 vulnerabilities.
Task 1: complete — authored Blender/GLB, desktop/mobile render inspection and responsive hero. Premium photorealism limitation explicitly retained in launch checklist.
Task 2: complete — real GLB phase unit test and sequence boundary tests 3/3; Chromium playback/pause/seek/replay/skip and GLB-load fallback pass.
Task 3: complete — all routes, phones, email, mobile Escape/focus and 404 pass.
Task 4: complete — npm ci, typecheck, production build, 8/8 Chromium scenarios, 0 npm production vulnerabilities. Exact npm run dev command confirmed hydrating correctly after local origin configuration.
Task 5 in progress — documentation and updated desktop/mobile screenshots saved; recording actual browser sequence and independent branch review remain.
