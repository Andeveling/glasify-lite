   ## Available Slash Commands

   ### 📝 /specify - Create Feature Specification

     * Purpose: Create or update feature specifications from natural language descriptions
     * Usage: /specify [feature description]
     * Output: Creates a new feature branch and generates spec.md with structured requirements

   ### 🔍 /clarify - Identify and Resolve Ambiguities

     * Purpose: Ask targeted questions to reduce ambiguity in specifications
     * Usage: /clarify [optional context]
     * Output: Updates spec with clarifications session, max 5 questions
     * When to use: Before /plan to reduce downstream rework

   ### 📋 /plan - Generate Implementation Plan

     * Purpose: Create detailed technical implementation plan and design artifacts
     * Usage: /plan [implementation details]
     * Output: Generates plan.md, data-model.md, contracts/, quickstart.md, research.md
     * Prerequisites: Requires clarified spec (runs clarifications check)

   ### ✅ /tasks - Generate Task Breakdown

     * Purpose: Create actionable, dependency-ordered task list
     * Usage: /tasks [optional context]
     * Output: Generates tasks.md with numbered tasks, dependencies, parallel markers
     * Prerequisites: Requires plan.md and design artifacts

   ### ⚙️ /implement - Execute Implementation

     * Purpose: Execute all tasks from the task breakdown
     * Usage: /implement [optional context]
     * Output: Implements entire feature following TDD approach
     * Prerequisites: Requires complete tasks.md

   ### 🔍 /analyze - Cross-Artifact Analysis

     * Purpose: Perform consistency and quality analysis across spec, plan, and tasks
     * Usage: /analyze [optional context]
     * Output: Structured analysis report with findings and recommendations
     * When to use: After /tasks before /implement

   ### 📜 /constitution - Update Project Constitution

     * Purpose: Create or update project constitution and governance
     * Usage: /constitution [principles or updates]
     * Output: Updates .specify/memory/constitution.md and dependent templates
     * Impact: Affects all other commands through constitutional compliance

   ## Command Flow & Dependencies

     /specify → /clarify → /plan → /tasks → /analyze → /implement
         ↓         ↓         ↓        ↓         ↓         ↓
       spec.md → clarity → plan.md → tasks.md → report → code

   ## Key Features

     1. Constitutional Governance: All commands respect project constitution principles
     2. Incremental Updates: Commands can be re-run to update artifacts
     3. Parallel Execution: Tasks marked with [P] can run simultaneously
     4. TDD Approach: Tests are generated and executed before implementation
     5. Validation Gates: Each command validates prerequisites before proceeding
     6. Error Recovery: Clear error messages and suggested remediation steps

   This system provides a structured, incremental approach to feature development
   from initial concept to full implementation, with built-in quality gates and
   consistency checks throughout the process.

   Ready to use any of these commands! What would you like to do next?