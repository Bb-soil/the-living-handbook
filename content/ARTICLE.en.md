# How to Build Small Projects with AI and Understand What Is Happening

[Русский](ARTICLE.ru.md) · [Live English version](https://the-living-handbook.fit-hake-0747.chatgpt.site/?lang=en)

> Editorial draft, source revision 1. AI-generated English translation.

Audience: Beginners with small personal projects; the advice is applied with attention to data, risks, stage, and learning goal.

## Contents

[Introduction](#introduction)
- [0. Your Role: Understanding the Goal and Checking the Result](#section-role)
- [1. Idea and Scope: Finish a Useful Scenario](#section-scope)
- [2. Problem Statement: Enough Clarity for the Next Step](#section-spec)
- [3. What Is in a Project and Why the Folders Matter](#section-structure)
- [4. Git and Secrets: Keep the Ability to Go Back](#section-git)
- [5. Agent context: short agreements instead of magic rules](#section-agent-context)
- [6. Simplicity: Don't Pay for Capabilities You Don't Use](#section-simplicity)
- [7. Tests: Check Important Behavior, Not Just Add More Tests](#section-testing)
- [8. What “done” means and how to read an agent's report](#section-done)
- [9. Before publishing: minimum security depends on risk](#section-security)
- [10. Refactoring: Changing Structure for Clear Benefit](#section-refactoring)
- [11. Optimization: First Figure Out What Is Actually Slowing Things Down](#section-performance)
- [12. After Launch: Developing the Project Based on Observations](#section-after-launch)
- [13. How Humans and Agents Can Use This Article](#section-agent-reading)
- [Appendix. Words That Appear in Agent Reports](#section-glossary)
- [Sources](#bibliography)

<a name="introduction"></a>

## Introduction

You describe an idea, the agent writes code, and then reports: "Added checks, refactored, optimized the architecture." If these words don't tell you anything yet, it's hard to tell whether the work has actually improved.

This article helps you understand basic development decisions. It is written for a beginner who is making a small personal project with an agent: a website, a bot, a note-taking app, or a utility. You don't need to become a professional programmer first. It offers a way to ask clear questions, notice unnecessary steps, and check the result.

The advice applies specifically to small projects and changes along with the risks. A learning prototype without real data and a public service with payments require different caution. Simplicity is a useful goal, as long as it doesn't destroy the needed behavior, data, or safety.

The examples with the note-taking app and the phrases for talking with the agent are editorial illustrations, not results of a measured experiment. The editorial was supplemented after re-reading previously inaccessible materials; technical definitions were additionally checked against primary sources. Access restrictions, use of the open part of paid material, and disagreements are listed separately in the [editorial notes](EDITORIAL_NOTES.en.md).

<a name="section-role"></a>

## 0. Your Role: Understanding the Goal and Checking the Result

When an agent creates dozens of files in a few minutes, it is easy to decide that it has taken over all the development. But how fast code appears says nothing about whether the task was understood correctly. You can quickly get a working program that solves a different problem.

Your first responsibility is to explain why the project is needed and how you will know that it is useful. Your second is to look at the result through the eyes of a user. To do this, you do not need to study the entire programming language in advance. You need to gradually understand the important decisions: where the data is stored, who can change it, what happens when there is an error, and how to return to a working state.

Simon Willison describes responsible work with agents as a combination of planning, checks, and control over changes. Being able to delegate writing code does not remove the need to make sure that you got the right product. [Vibe engineering](https://simonwillison.net/2025/Oct/7/vibe-engineering/).

#### Why an agent may agree too easily

Models can tend to adjust their answers to fit the beliefs of the person they are talking with. This behavior is called *sycophancy*: a user’s confident tone may get support instead of a check of the underlying assumptions. This does not mean that every agreement is wrong; agreement by itself is simply not proof. [BYU–Idaho explanation](https://www.byui.edu/ai/training/syncophancy).

For example, a request such as “add more tests so it becomes more reliable” sounds reasonable. However, new tests may check what has already been verified, while an important bug in saving data remains unnoticed. It is more useful to name the concern: “I am afraid that after changing the form of a note, notes will start getting lost. How can we check this?”

The opposite extreme is an agent that argues with every request and does not accept your choice. One of the materials proposes a strict mode of objection; this article chooses a different rule: explain the trade-off, suggest an alternative, and respect a person’s deliberate decision. This is an editorial decision of this project, not a general conclusion shared by all sources. [Position on forced objection](https://dev.to/luca_morricone/sycophancy-free-coding-how-to-make-ai-agents-say-no-3l43).

> If my request creates noticeable complexity, explain the specific cost and suggest a simpler path. If I understand the consequences and confirm my choice, continue without repeating the argument.

The right to choose applies to acceptable engineering decisions. It does not turn a lack of access, someone else’s data, or security constraints into a minor technical detail.

**Section sources:** [1](#source-1), [5](#source-5), [6](#source-6)

<a name="section-scope"></a>

## 1. Idea and Scope: Finish a Useful Scenario

Imagine a personal note-taking app. The first goal is to write a thought, save it, and find it later. Even in the first conversation, it is easy to add tags, a calendar, sync, shared access, and automatic summaries. Each feature seems small, but together they change the size of the project.

*Scope*, or объём, is what you have decided to build in the current release. *Scope creep* is its unnoticed expansion: one more useful idea quickly turns into a required task. In the Wayline material, this problem is discussed using small games as examples; the principle also applies to a personal app. [Scope creep roadmap](https://www.wayline.io/blog/indie-dev-scope-creep-roadmap).

For a note-taking app, the first complete scenario could be this: open a page, write text, save it, refresh the page, and see what was saved. A nice screen without saving does not yet do the job. A short path from start to result is often more useful than many half-finished features.

Do not confuse three goals. A **prototype** answers the question: “Is this even convenient or feasible?” An **MVP** delivers the core benefit with minimal scope. A **first working version** may also include data recovery, error handling, and launch for other people. The names do not define a universal set of features: write down exactly what you promise your users.

Start with a short description: who uses it, what action they perform, what result they get, and what will not be in the first release. The PRD template separately highlights the goal, boundaries, and user path. Use these questions without copying the whole template scope into a small task. [PRD template](https://gist.github.com/gkossakowski/21cd41fc3801de9d7d0201e0792c7ded).

A quick working prototype helps you test an assumption before a large implementation. But an example from someone else’s article does not set a timeline for your project: learning the tools, integration errors, and data checks take different amounts of time. [Approach to small prototypes](https://aispaces.substack.com/p/vibe-coding-playbook-for-pms).

To decide what to postpone, divide features into those required for the main scenario, those useful later, and those that are optional for now. For a note-taking app, saving text is required, while several color themes can wait. Evaluate both the benefit and the future maintenance cost. Time already spent does not by itself make a feature necessary: if nobody uses it, it can be reconsidered. A guide for solo developers shows this approach with game prototypes; here it is adapted to a small app. [How to reduce prototype scope](https://www.wayline.io/blog/solo-dev-prototype-faster).

You can write a new idea down for later. If it is needed right now, deliberately revisit the release: what will be added, what will be postponed, and what risk will remain. This way the project changes by the owner’s decision, not by the momentum of the conversation.

**Section sources:** [8](#source-8), [9](#source-9), [10](#source-10), [52](#source-52)

<a name="section-spec"></a>

## 2. Problem Statement: Enough Clarity for the Next Step

The agent does not know what is still in your head. "Make a convenient form" does not explain which fields are needed, where the result is sent, or what to show when there is an error. The agent will fill the gaps with assumptions. Sometimes they will turn out well, and sometimes they will be expensive.

For a small feature, it is enough to describe the goal, the sequence of actions, the expected result, and the essential constraints. For example:

> In the notes app, add editing of an existing entry. After saving and refreshing the page, the new text should appear. If saving fails, do not show success and do not erase what was entered. Do not change the storage method or the appearance of other pages.

This is not yet a detailed architecture, but the task already has verifiable boundaries. Addy Osmani recommends starting with a clear goal, refining the plan, and breaking large work into manageable parts, without overloading the context with a huge specification. [How to write specs for agents](https://addyosmani.com/blog/good-spec/).

*Acceptance criterion* is an observation that shows clearly that a requirement has been met. "Everything works" is not such a criterion. "After restarting the application, the edited note was saved" is. Not all criteria can be automated: the convenience of a form may require your own review.

Break large work into steps, each with a visible result and a working point in Git. In the "think like a tech lead" approach, it is also important to check documentation against the implementation: a nice description does not yet mean that the feature exists. For a personal project, these habits are useful even without a team of several agents. [Managing tasks and checking documentation](https://salesforcedevops.net/index.php/2025/06/04/the-secret-to-managing-ai-coding-agents/).

It is useful to separate a requirement from a proposed way to meet it. "The user should not have to wait a minute" is a requirement. "Add Redis" is already an implementation option, which may turn out to be unnecessary. First explain the problem, then let the agent choose a solution that fits the situation.

Alexey Grigoryev's example shows that even successfully working code with tests can implement a different interpretation of a vague idea. Clarifying the user scenario is needed before you start judging the quality of the implementation. [Specifications and the working cycle](https://alexeyondata.substack.com/p/ai-native-development-specifications).

A short task becomes more precise when you name the input, the result, and the reaction to an error: what the person enters, what the application saves, and what happens on failure. In an analysis of beginners' mistakes, the lack of such boundaries is named as one of the reasons for an incorrect implementation. These are useful questions to ask about a task; they do not imply that a large mandatory specification is needed. [Mistakes in task formulation](https://pub.towardsai.net/5-mistakes-beginners-make-when-vibe-coding-and-how-to-avoid-them-de828f7a269a).

#### When Documentation Becomes Too Much

In the personal experience of the author of "How I manage AI as a Non-Developer," mandatory descriptions of decisions grew to about 900 files, yet an important error in how the parts interact still went unnoticed. After that, he began to go deeper into analysis for three reasons: a new architecture appears, sensitive data is affected, or the decision is hard to reverse. This is a useful starting point: an ordinary edit does not need the same process as a change in data storage. Mandatory project checks still apply. [How the author shortened his own process](https://maximerumpler.substack.com/p/how-i-manage-ai-as-a-non-developer).

A plan is useful as long as it reduces uncertainty about the next step. If you describe dozens of hypothetical features while the main scenario has not yet been tried by anyone, it is worth postponing part of the work. When your understanding of the product changes, the specification is updated as well; it does not have to permanently lock in the first guess.

The sources show a tension between detailed planning and quick experimentation. For a small project, a workable compromise is to agree on the nearest result, implement it, check it, and then refine the next step. Do not replace uncertainty with endless documentation. [Critical review of spec-driven development](https://alexcloudstar.com/blog/spec-driven-development-2026/).

**Section sources:** [2](#source-2), [3](#source-3), [4](#source-4), [11](#source-11), [12](#source-12), [13](#source-13)

<a name="section-structure"></a>

## 3. What Is in a Project and Why the Folders Matter

A project is not just program text. It contains source code, settings, third-party libraries, checks, and data. If you know what these parts are for, the agent's report becomes much easier to understand.

**Source code** describes how the application behaves. **Settings** define how it is built and run. **Dependencies** are other people's libraries that your code uses. **Data** is the content the application creates or stores, for example your notes. **Build output** is the files prepared for running; they can often be generated again from the source code.

README usually explains the project's purpose and how to run it. In a JavaScript project, package.json records, among other things, the dependencies and commands. The lock file fixes the specific dependency versions chosen during installation. The tests folder may contain checks, and public may contain publicly accessible images and other files. Names differ between tools; the absence of this exact folder is not an error. [A non-technical introduction to how a project works](https://www.bensbites.com/p/a-non-technical-guide-for-how-code-works).

For example, in the sample Svelte/Vite project, the source code is in src, the root component is called App.svelte, and the bundler settings are in vite.config. Another framework will have a different layout. The node_modules folder contains installed dependencies: its contents are usually restored by installing packages, and changes to your own application are made in the source code. This helps you tell your own code apart from library files. [Example of a Svelte project structure](https://codefinity.com/da/courses/v2/fb1ac3cf-b8c0-4d28-b4fa-bed1dfbba00b/47b754e0-60e2-4302-87df-d392d62966fc/f5588a3c-241a-4d86-ac9c-695dfccc217c).

#### Interface, server, and database

*Frontend* is the part a person interacts with: pages, fields, and buttons. *Backend* is logic that runs on the server: saving, access checks, and calls to external services. A *database* stores records between actions and launches. An *API* defines which requests one part of the program may send to another and what responses to expect. [A glossary of basic terms](https://blog.vibecoder.me/vibe-coding-vocabulary-every-term-you-need).

In a notes app, the browser may show a form, the server may check a save request, and the database may store the record. These are different responsibilities, but they do not require three repositories or three separate servers. One application can contain both the interface and the server-side part.

Do not confuse the separation of responsibilities with folders, repositories, and deployments. The author of one of the materials keeps the frontend and backend in one repository but runs them separately. This is a way of organizing the work, not a mandatory condition for a correct structure. Separate deployment requires coordinating addresses, settings, and APIs; for a small project, name the benefit that justifies taking on this work. A server secret must stay on the server under any folder scheme. [One repository with two parts](https://dev.to/aditya_sorathiya_069252f4/why-i-keep-my-frontend-and-backend-separate-even-in-the-same-repository-390j).

Folders help you find related parts. For example, routes accept requests, data functions read and save records, and components describe interface elements. The Node.js guide shows one way to separate responsibilities; its tree should not be turned into a mandatory standard for every framework. [The purpose of server-side folders](https://dev.to/jovickcoder/mastering-backend-nodejs-folder-structure-a-beginners-guide-2o2e).

A poor reason to restructure is “a good project should have more layers.” A good reason is “right now the save rule is duplicated in several places, so the fixes drift apart.” Structure should make specific work easier.

#### What to ask the agent to show

> Explain where the note page is located, where the save request is accepted, and where the data is written. Show the path of one action from the button to the storage. Separately list the files that can be recreated, and the data that cannot be restored by reinstalling.

Such an explanation is more useful than a list of every file. It gives you a map of the project to compare against later changes. However, a database with user records does not become a backup just because it sits next to the code.

**Section sources:** [14](#source-14), [17](#source-17), [19](#source-19), [20](#source-20), [54](#source-54)

<a name="section-git"></a>

## 4. Git and Secrets: Keep the Ability to Go Back

Git stores the history of committed project changes. It helps you see differences, find a working version, and undo a specific mistake. GitHub is one of the services where you can store a remote repository; it is not another name for Git.

**Commit** records the chosen state of tracked files in the local history. **Push** sends commits and related data to the remote repository. Pressing push by itself does not create a new commit. This distinction matters: a file may be changed on your computer but not yet be in the history or on GitHub. [Git: commit](https://git-scm.com/docs/git-commit), [Git: push](https://git-scm.com/docs/git-push).

Before a significant experiment, it is useful to have a clear working point. First make sure that secrets and accidental files have not gotten into the changes you are saving, then commit the result. After a new feature, test it and save it as a separate small commit. Such a history is easier to review than one huge bundle of “everything for the week.” [Git for beginners](https://www.questera.ai/blogs/version-control-for-non-developers-git-basics-vibe-coders).

*A branch* lets you keep a separate line of changes. It is useful for experiments, but it does not create a separate copy of the database and does not isolate external services. Two agents working in the same folder or with the same working database can get in each other's way despite having different intentions.

Learning materials sometimes propose a complex branch scheme right away. For a personal project, clear commits and the ability to restore your work matter more than many permanently existing branches. [One of the proposed workflows](https://www.braingrid.ai/blog/git-version-control-for-ai-builders).

#### Code and data roll back differently

Returning old code does not restore deleted notes. If an update changes the database structure, you need a separate plan: a backup and a verified way to restore it. Deleting others' local changes with a “reset everything” command is also not a safe, universal fix.

Before rolling back, ask:

> Show what will be lost when reverting, whether it will affect data, and which uncommitted changes need to be saved. First suggest a reversible option.

#### API keys are access, not plain text

A service's private key may allow requests charged to you or grant access to data. Do not paste it into public code, examples, screenshots, or shared chats. A server environment or a suitable secrets store is better than a hard-coded key; client-side JavaScript is not the place for a server secret.

If a secret has already been published, deleting the line is not enough: the key must be revoked or replaced with the provider, and its usage should be checked. The old value may remain in history or in copies. The mere presence of a .env file does not make an application secure. [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

**Section sources:** [21](#source-21), [22](#source-22), [56](#source-56), [57](#source-57), [59](#source-59)

<a name="section-agent-context"></a>

## 5. Agent context: short agreements instead of magic rules

The agent works with the messages, files, and tool results available to it. It may not know about an agreement made in another chat, a manual setting on the server, or the reason behind a solution that looks strange. That is why it is better to keep important context next to the project.

A useful memo includes the purpose of the application, how to run it, the commands for checks, a map of the main parts, and the real constraints. For example: “Do not change the export format without discussion: another program uses it.” There is no need to retell the entire source code or add dozens of abstract calls for quality.

GitHub recommends specific commands, clear boundaries, and examples instead of a general role such as “experienced developer.” At the same time, the material describes GitHub's own agent mechanisms: file names and format should not be automatically transferred to another tool. [GitHub recommendations](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/).

A familiar file name does not yet mean that your agent reads it. Check the documentation of the chosen tool and its actual behavior: ask it to name the project constraints in effect and show where they come from.

In a larger project, the map is helped by one current example: “we make the new form based on this one,” “saving is done through this function.” The FutureX guide suggests explicit module boundaries, interfaces, and accepted patterns. For a small application, it is enough to show the existing path; creating a separate package for each feature just for such a map is not required. [Context and boundaries in a large project](https://dev.to/futureim/scaling-your-vibe-architecting-large-projects-with-futurex-2k4h).

The memo must be updated together with the code. In the More Simplification case, old instructions about keeping compatibility prevented removing unnecessary constructs. Before simplifying, find out who really uses the old interface: another program, real users, or just a forgotten experiment. Then clarify the rule. Compatibility with current clients cannot be declared unnecessary just because maintaining it gets in the way of cleanup. [How old instructions hindered simplification](https://fuguediaries.substack.com/p/pr-6-more-simplification).

#### A rule in the text and a technical restriction are different things

A request like “don't touch the working database” is useful, but it is more reliable also not to give the agent the corresponding access. The model reads the instruction; permissions and the execution environment restrict access technically. Anthropic's documentation distinguishes such mechanisms separately. [Instructions and enforced restrictions](https://code.claude.com/docs/en/best-practices).

Give access by task. Changing the color of a button does not require a key for deleting cloud resources. Checking reads does not require allowing writes. This lowers the cost of a possible mistake without endless approval of every safe step.

A short task with current information is usually more useful than a huge message about the whole project. If work was interrupted, save a small handoff: what is already done, which checks passed, what remains, and where the important files are. Such a document does not have to become a multi-volume history of the conversation.

> First read the project instructions and the needed part of the code. Name the nearest verifiable result. If you can make an ordinary technical decision within the task, make it yourself; explain any significant expansion of scope separately.

A good setup reduces misunderstandings but does not guarantee that the agent will be error-free. Checking the result still remains part of the work.

**Section sources:** [18](#source-18), [25](#source-25), [26](#source-26), [42](#source-42)

<a name="section-simplicity"></a>

## 6. Simplicity: Don't Pay for Capabilities You Don't Use

Complexity is not just a large number of lines. It appears when a small change requires understanding many connections, configuring several services at once, or remembering hidden exceptions. Short, tangled code can be harder than long but straightforward code.

A new mechanism has two costs: creating it and then maintaining it. Libraries need updating, configuration has to be explained to the next agent, branches of behavior need testing, services need paying for and restoring after failures. So "the agent wrote it for free in a minute" does not mean that owning it costs nothing.

Before writing something new, it is useful to check whether the needed behavior already exists in the project, in standard platform features, or in a library that is already installed. The AgentConn material proposes a similar selection sequence. It is useful as a question to ask about the task, but the advertising and statistical claims in that material are not needed to apply it. [First check for an existing solution](https://agentconn.com/blog/best-code-agent-doesnt-write-2026/).

#### What premature complication looks like

For a note-taking app with one author, an agent proposes plugins, a universal permissions engine, and several storage options to choose from. If you do not plan to use these capabilities, you have to verify more behavior for a benefit that does not yet exist. This growth of layers is often called *abstraction bloat*. It is a description of a symptom, not a diagnosis based on the number of files. [An analysis of excessive abstractions](https://agentpatterns.ai/patterns/anti-patterns/abstraction-bloat/).

Added complexity can be justified. For example, a separate access check is needed not because "big companies do it this way," but because otherwise a user could change other people's records. When you remove architectural decorations, you must not remove the mechanism that fulfills an actual requirement.

A useful question to ask the agent:

> What existing problem does this layer or service solve? What will stop working if we do without it now? Is there a simpler way to meet the same requirements?

The phrase "make it as short as possible" can also cause harm. In an example from a guide against over-engineering, such a constraint led to the loss of validation. It is better to ask for a minimal change that fully completes the task and keeps the necessary checks. Simplify the affected part, and justify any broader cleanup of the whole project separately. [Minimal scope without losing behavior](https://mcp.directory/blog/stop-claude-code-over-engineering-2026).

#### Debt can accumulate even from locally good decisions

Neil Kakkar describes a case where nearly identical parts of an interface diverged, and the agent started changing the wrong copy. Quickly completing individual tasks does not guarantee that the project as a whole stays understandable. Sometimes simplifying existing duplication is exactly what speeds up the next piece of work. [Agentic Debt](https://neilkakkar.com/agentic-debt.html).

*Technical debt* means accumulated decisions and deferred maintenance that make future work more expensive. The Codegen glossary emphasizes exactly this future cost. Quickly written code does not necessarily create meaningful debt. It is more useful to name a specific obstacle, for example: every change to the note format requires synchronously editing three diverging copies. [What technical debt means](https://codegen.com/glossary/technical-debt/).

But the answer should not be a mandatory global refactoring after every function. Identify a concrete obstacle, define a small area, and check whether the change will pay off.

Even the work process can be out of proportion: a full cycle of discussions, automations, and reports may be heavier than fixing a typo. Cyfrin's experience shows such a case; this is the authors' observation, not a universal cost of any agent work. [When the process costs more than a small change](https://www.cyfrin.io/blog/expensive-and-slow-for-small-changes-why-ai-coding-agents-can-be-overkill).

**Section sources:** [27](#source-27), [28](#source-28), [30](#source-30), [31](#source-31), [32](#source-32), [43](#source-43)

<a name="section-testing"></a>

## 7. Tests: Check Important Behavior, Not Just Add More Tests

A test is a check with an expected result. It is useful if it catches a mistake you want to detect. The number of tests without an explanation of their purpose says little about reliability.

For a note-taking app, it matters more to make sure a saved note can be read after the page is refreshed than to create many checks of unchanging labels. If the app uses accounts, being unable to read someone else's note is critical. When handling money, calculations and repeated requests matter. Priority is determined by the damage, the likelihood of error, and how often things change. [How to start checks for a small app](https://www.13labs.au/blog/using-ai-to-build-a-test-suite).

#### Different checks answer different questions

A *unit test* checks a small part, such as a sum calculation. An *integration test* checks how parts interact, such as saving through a real database layer. An *end-to-end* test walks through a user path across the app. Manual checking is needed where appearance and clarity matter and there is not yet a good automatic criterion.

You don't need to run every kind of check for every change. But you cannot claim the app fully works if you only checked a single function. Choose the method to fit the claim you want to confirm. [Options for checking AI-generated code](https://www.sitepoint.com/testing-ai-generated-code/).

*Mock* replaces a real external component with a controlled imitation. This lets you quickly check how the app reacts to a service error. However, a passing test with a mock does not prove that the real address, key, request format, and service are compatible.

The limit of this kind of check is especially important when adding a new server request. If a test replaces the save function itself and then checks the response of that replacement, it does not confirm that saving works. Check at least the main real path through the connected parts of the app. In the author's personal case of managing AI, a detailed process did not help notice precisely the problem of connecting a real session. [The gap between checks and a working app](https://maximerumpler.substack.com/p/how-i-manage-ai-as-a-non-developer).

#### Why an agent's tests can confirm its own mistake

If an agent misunderstands a rule, it can write a wrong implementation and a test with the same wrong expectation. For example, the requirements forbid an empty note, but the code saves it, and the test checks exactly that successful save. Everything is green, but the goal is not met.

This is the reason to start from the expected behavior rather than asking to “cover the existing code.” Despite the provocative title of Swizec's article, its substantive question is which checks actually establish correctness rather than repeat the implementation. [Why how tests are created matters more than authorship](https://swizec.com/blog/why-you-shouldnt-use-ai-to-write-your-tests/).

> Write down several independent expectations from the task. For each proposed test, explain what mistake it will catch. Do not derive the correct answer only from what the code currently returns.

To fix a reproducible bug, it is useful to see a test that fails before the fix and passes after. This shows that it is really tied to the bug. For subjective design this approach may not fit; then a human needs to review the result. [When the test-first cycle is useful](https://stevekinney.com/courses/ai-development-setup/patterns-for-proving-it-works).

#### How many tests are enough

There is no universal number or mandatory coverage percentage for all personal projects. *Coverage* shows which parts of the code ran during tests, but it does not guarantee that the expectations are correct. At the same time, important uncovered areas help you find real gaps. [Google: how to use coverage](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html).

For the current change, stop when the claimed behavior and the significant risks involved have been checked, the project's required checks have passed, and there is no specific reason to extend the set. If you change only the prompt text, a new test is not automatically required. If you change saving or access, the absence of new useful checks requires an explanation.

Do not delete checks just because they prevent you from getting a green result. But do not treat an old test as eternal truth either: a change in requirements may legitimately change the expected behavior. Such a decision must be explicit.

**Section sources:** [3](#source-3), [36](#source-36), [44](#source-44), [45](#source-45), [46](#source-46), [62](#source-62)

<a name="section-done"></a>

## 8. What “done” means and how to read an agent's report

Phrases like “done,” “optimized,” and “all tests pass” are claims. Their value depends on what stands behind them.

A good report makes clear: what behavior changed and why; how it was verified; what was not verified; and whether there are any limitations. For a team's checks, useful information includes the check command's exact name, its completion result, and confirmation that the needed checks actually ran. One successful test should not be retold as success of all of the project's tests. [How to verify claims of readiness](https://aident.ai/blog/verify-ai-coding-agent-tests-pass).

Compare two reports. “Improved saving, everything works” does not help you accept the work. “Network errors now leave the text in the form; verified by simulating an unsuccessful response. Saving and reading are verified locally; I have not yet checked on the public server” gives a basis for a decision.

A useful request:

> Briefly link each significant result to a check. Separately say what remains unverified. Do not call a fixture, mock, or local run proof that a real external service works.

A check must have a clear way to detect the relevant breakage. A command that just prints “done,” or a successful git status, does not confirm that saving works. For an interface, a real action is useful; for a document, reading the content, not just confirming the file exists. If a check failed, give the agent its actual output and limit the number of fix attempts. Repeating “try again” without new information is less useful than analyzing the observed error. [Checks that can detect an error](https://bigideasdb.com/help/how-to-verify-ai-agent-work).

#### Why look at the diff

A *diff* shows added and removed lines. Even if you don't read a programming language fluently, the list of files can reveal an unexpected area of change. You asked to fix a signature, but the database, input, and dependencies changed — that needs analysis.

The report helps you understand the agent's intent, while the diff lets you check which lines actually changed. In the material “Read the diff, not the summary,” this exact difference is useful: a small, targeted edit is easier to compare with the request than a package of unrequested improvements. The diff itself does not prove that things work — it should be complemented by running and checking the scenario. [Why to compare the report with the changes](https://dev.to/eduzsh/read-the-diff-not-the-summary-20l1).

A *pull request*, or PR, is a proposal to merge changes. It is a convenient place for the description, the diff, and the check results. A PR by itself is not a quality certificate. A separate branch and a PR also do not guarantee the absence of actions on live services: the agent could have contacted them regardless of merging. [A clear introduction to PRs](https://www.braingrid.ai/blog/what-is-a-pull-request-non-engineer-guide).

Start the review with the user result and the boundaries: did you get what you asked for; is there any extra feature; did a check disappear; did a new service appear? For a note-taking app, open the form, save, refresh the page, and try invalid input.

During a technical review, pay attention to removed lines: along with them, input validation or error handling may disappear. A training module on code review suggests looking for four things: a nonexistent API, a task expanded without explanation, removed handling of edge cases, and plausible but incorrect logic. In its example, a new command works, but a neighboring command silently reports success on a wrong index after the edit. So it is useful to check invalid input too. If you don't understand a changed section, ask for it to be explained with a concrete example; for significant risks, you need help from someone able to verify the explanation. [How to read changes and notice lost behavior](https://github.com/recklessop/ai-workflow-course/wiki/10-reviewing-code-you-didnt-write).

However, clicking through the interface does not allow a full assessment of security and hidden logic. The more costly a possible error — access to data, payments, deletion — the more important a technical check becomes. A second agent can help find defects, but agreement between two models is not independent proof. [Discussion of risk-based review](https://agentsroom.dev/blog/should-you-review-ai-agent-code).

Changing code and tests together is normal for a new feature or a bug fix. What is concerning is different: without explanation, an expectation is weakened, a failing check is turned off, or the task is changed to get a green result.

If the agent could not run a check because of the environment, an honest “not verified” is more useful than a confident guess. Decide whether the limited result can be accepted now and what needs confirmation before launch.

**Section sources:** [33](#source-33), [37](#source-37), [38](#source-38), [39](#source-39), [40](#source-40), [41](#source-41)

<a name="section-security"></a>

## 9. Before publishing: minimum security depends on risk

A local experiment with fictional data and a public app with personal notes are different situations. When a service is available to other people, what matters is not only convenience and the main scenario, but also what an outsider could do.

First, answer some simple questions: what data is stored, who has access to it, which actions cannot be undone, and what could cost money. The answers give you a small set of mandatory checks. Payments, medical information, or other sensitive data may require help from a specialist. The size of your team does not reduce these risks by itself.

The Cloud Security Alliance guide highlights secrets, safe data handling, access restriction, and backups with restore verification among its basic topics. Use it as a direction for review, not as a promise of security after a single list. [Secure Vibe Coding Guide](https://cloudsecurityalliance.org/articles/secure-vibe-coding-guide).

#### A hidden button does not protect an action

*Authentication* answers who is in front of you. *Authorization* answers what that person is allowed to do. The absence of a delete button for a reader does not stop them from sending a delete request directly.

The server must check the right to perform an action and the specific object. In an app with accounts, it is not enough to confirm that the user is logged in. You also need to check that the note belongs to them or is available under the established rules. A useful negative test is user A trying to read or change record B. [OWASP: authorization checks on requests](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

#### What to check before a public launch

Ask the agent to check the things that apply to your project:

- private keys are absent from public code, the client build, and logs;
- protected actions cannot be performed without the necessary rights;
- input is validated on the server, and database work does not build queries by unsafe text substitution;
- user text is displayed safely and is not executed as HTML or code;
- public expensive operations have reasonable limits;
- there is a data backup and a restore that has actually been tested.

This is not an exhaustive audit. Specific measures depend on the stack and the data, and not every item from someone else's checklist applies to your app. For example, advice about the settings of a certain cloud database does not mean you must use that database.

Do not ask the agent to 'implement your own cryptography in a simpler way.' For passwords, sessions, and payments, rely on supported mechanisms and their current documentation. The result of an automatic security check is a reason to look into a specific finding, not a certificate that there are no errors.

A secret that has ended up in a publication must be revoked with the provider. Deleting a line does not revoke access. Also, do not promise that every key pasted into any AI chat necessarily ends up in training data, because storage modes differ. A reliable practical rule is simpler: do not pass a secret anywhere it is not needed. [OWASP: secrets management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

**Section sources:** [47](#source-47), [58](#source-58), [59](#source-59)

<a name="section-refactoring"></a>

## 10. Refactoring: Changing Structure for Clear Benefit

Refactoring is changing the internal structure of code while keeping its observable behavior the same. If the rule for saving changes along with the restructuring, or a new feature appears, it is no longer just refactoring. This distinction helps you understand what exactly to check. [Martin Fowler's definition](https://refactoring.com/).

“The code looks ugly” is a weak description of a task. “To change one rule, I have to edit three copies, and they regularly drift apart” is a concrete problem. Other reasonable reasons include: it is hard to locate a bug, an important part cannot be tested separately, names hide the meaning, or a new scenario runs into tangled connections.

However, you should not wait until every change becomes painful. A small cleanup in the affected part may cost less than the accumulation of obstacles. Atomic Object advises avoiding both extremes: premature restructuring and endlessly postponing a clearly understood problem. [When refactoring pays off](https://spin.atomicobject.com/when-to-refactor-code/).

#### Identical Lines Do Not Yet Mean a Shared Rule

Suppose a note and a reminder currently check the length of a title in the same way. Later, they may get different limits. If you merge them into one universal function with many switches, there will be less visual repetition, but the connection between independent tasks will become stronger.

DRY means striving not to duplicate the same knowledge, but applying it rigidly to any similar-looking lines can create a premature abstraction. First, work out whether these parts should change together. If the meaning is shared and the copies have already started to diverge, merging is useful; if the similarity is accidental, a small amount of repetition is acceptable. [Google: don't apply DRY prematurely](https://testing.googleblog.com/2024/05/dont-dry-your-code-prematurely.html).

#### How to Limit Restructuring

Choose a goal, a section of code, and a way to confirm that behavior has been preserved. For example: “Reduce the three implementations of note saving to one, without changing the data format; check creating, editing, and a write error.” This is easier to assess than “bring the whole project up to best practices.”

First, record a working checkpoint and check the main scenarios. Then figure out which parts use portable code and which imports will need updating. Do not mix together, without necessity, moving files, updating dependencies, and changing logic: if something breaks, it will be easier to find the cause. Write down any old bug you discover separately and fix it in a following, clearly defined change. This order is suggested in the open beginning of a guide to cleaning up a vibe-coded codebase; the paywalled continuation was not used here. [Preparing for safe restructuring](https://nelsonxlee.substack.com/p/clean-up-your-vibe-coded-codebase).

The story about drifted copies of an interface from Agentic Debt shows that simplification can help both a human and the next agent. But the mere possibility of deleting lines does not prove an improvement. [An example of accumulated duplication](https://neilkakkar.com/agentic-debt.html).

If you want to rework a module for learning purposes, say so directly. The goal then may be understanding for you, even if the work does not speed up in the short term. The agent should help choose the boundaries of a learning experiment and a way to return to the previous state, not declare such a goal irrational.

**Section sources:** [16](#source-16), [32](#source-32), [50](#source-50), [51](#source-51), [60](#source-60)

<a name="section-performance"></a>

## 11. Optimization: First Figure Out What Is Actually Slowing Things Down

Optimization changes how much time, memory, requests, money, or another resource is used. So a request to “optimize everything” does not yet set a measurable goal. Speeding up page loading, reducing API bills, and cutting memory use are different tasks.

Start with an observation. For example: a note saves with a noticeable delay; a list becomes awkward with a large number of entries; one action sends too many paid requests. Specify the conditions: how much data there is, which screen is involved, where the app runs, and how often the problem occurs.

Performance analysis methods, including Brendan Gregg’s USE Method, suggest first asking diagnostic questions and checking resource limits. For a small project, you do not need to learn an entire server profiler. What matters is the shift from guessing to measuring. [The USE Method](https://www.brendangregg.com/usemethod.html).

Ask the agent to record the baseline result, find the likely bottleneck, change a small part, and repeat the measurement under comparable conditions. At the same time, check that correctness has not been lost. A fast save that sometimes loses text is not a successful optimization.

Arpit Bhayani points out a new trap: AI makes complex implementation cheap, so caches, batch processing, and extensible strategies appear before a clear need exists. But the maintenance of these mechanisms remains. The question “can the agent write this quickly?” is worth supplementing with “what confirmed problem does this solve?” This is the author’s engineering observation, not a measured effect for any project. [Why Premature Optimization Has Become Easier](https://arpitbhayani.me/notes/ai-makes-premature-optimization-effortless-leading-to-over-engineered-code/).

#### Why a Cache Is Not a Free Speedup

A cache stores a result so that it does not have to be computed or fetched again. However, you need to decide when the result becomes outdated. If a note has changed but the reader sees the old text from the cache, you have traded speed for an error in freshness.

This is not a reason to reject caches. It is a reason to ask: is there a repeated expensive operation; is a simple cache enough; how is it updated; can the gain be confirmed? If the note app already responds fast enough at your data volume, an additional mechanism may not pay off.

The same applies to the agent’s process. For a small change, a long multi-step cycle may cost more than the work it performs. Do not transfer one author’s observations about costs to every model and every task; compare your own results. [Experience with a Disproportionate Process](https://www.cyfrin.io/blog/expensive-and-slow-for-small-changes-why-ai-coding-agents-can-be-overkill).

You do not need to deliberately choose an obviously wasteful approach just because the project is small. But it is better to distinguish infrastructure built for an imagined load from fixing a problem that is already observed. A reasoned estimate of a future bottleneck is also possible. In that case, have the agent state its assumptions explicitly, rather than presenting a forecast as a completed measurement.

**Section sources:** [29](#source-29), [30](#source-30), [61](#source-61)

<a name="section-after-launch"></a>

## 12. After Launch: Developing the Project Based on Observations

A launch gives you something no plan can: real actions by real people. You may discover that you rarely use tags but constantly search for recently changed notes. In that case, improving sorting may be more useful than the complex classification system you planned in advance.

Separate bugs, inconveniences, and new features. A bug breaks promised behavior. An inconvenience makes a useful action difficult. A new feature extends the promise. These tasks may have different priorities and need not be done in one batch.

In the Wayline story, a sequence of appealing additions gradually made it impossible for a small project to reach completion. The practical conclusion for a personal app: keep the list of ideas separate from the current release and periodically review priorities. [How scope grows](https://www.wayline.io/blog/indie-dev-scope-creep-roadmap).

Lifespan also changes decisions. A one-off experiment can be thrown away. An app you use every day deserves a clear launch, backups, and protection of important scenarios against repeated mistakes. A small size does not mean the project stays a draft forever.

Record technical obstacles specifically. Instead of 'a large debt has accumulated,' write 'login is configured manually and not documented,' 'after a library update the export broke,' 'one rule is duplicated in two places.' This makes it easier to choose the next improvement and check its result.

After each launch, you don't need to ask for 'a full audit, a global refactoring, and more tests.' First ask which observation justifies these actions. If you discover a leak, data loss, or a serious access error, investigation may instead become more important than the next feature.

Record product changes in a short requirements description and the README. The next agent should see the current launch and the actual constraints, not guess them from old comments. Removing an unused feature sometimes improves a product more than adding a new one; the decision requires understanding who uses it.

A good next step is one for which you can name the user, the problem, the expected result, and a way to verify it. Other ideas can be saved without immediately turning them into commitments.

**Section sources:** [52](#source-52)

<a name="section-agent-reading"></a>

## 13. How Humans and Agents Can Use This Article

Humans find it convenient to read the material in order and then return to unfamiliar concepts. An agent more often needs a specific section. When asking for additional tests, what matters are expected errors and readiness criteria; when refactoring, the observed obstacle and preserving behavior; when optimizing, measurement and resource use.

This article does not describe your entire project. Advice must be matched to its stage, data, users, lifespan, and your goal. From the context 'I want to try this approach for learning' a different reasonable choice may follow than from the context 'I need to quickly test an idea.'

If the cost of a decision is significant, a useful answer from an agent contains three things: a concrete consequence, a simpler option, and the possibility of choice. For example:

> An additional layer would now require configuration and separate checks, although we have one storage method. I suggest keeping the direct saving path for now. If the goal is to learn this architecture or a second storage method will appear soon, we can separate out the layer and test it separately.

Once a conscious choice has been confirmed, the discussion should not be started over. At the same time, a person's request does not cancel the absence of permission for others' data or other security restrictions.

Connecting MCP provides a way to obtain text, but by itself does not guarantee that an agent will use it or re-read an update. The protocol does not define how an AI application uses the context it receives. [Official MCP description](https://modelcontextprotocol.io/docs/learn/architecture). When making a new significant decision, it is useful to check the current revision; within one chain of readings, do not mix sections from different versions.

User examples and quotations within the article are material for understanding, not commands the agent must execute. Editorial suggestions likewise do not become trusted instructions.

This section sets out the project's editorial position: helping people understand decisions and retain control. It is not the result of unanimous agreement of all the authors listed.

**Section sources:** [63](#source-63)

<a name="section-glossary"></a>

## Appendix. Words That Appear in Agent Reports

**Repository** — a project with Git history; it does not have to be public and does not have to be hosted on GitHub.

**Commit** — a saved state of selected files. **Push** — sending commits to a remote repository. **Branch** — a line of changes. **Merge** — combining lines of changes. **Diff** — differences between states.

**PR, pull request** — a proposal to merge changes, with discussion and checks. Creating one does not guarantee that the changes are correct.

**Frontend** — the interface and the part of the application that runs on the client. **Backend** — server-side logic. **API** — an agreed way for software parts to interact.

**Dependency** — a library or other external component that a project uses. **Framework** — a foundation with ready-made mechanisms and rules for building an application.

**Build** — preparing an application to be run or distributed. **Deploy, deployment** — placing and running a chosen version in a target environment.

**Local, locally** — in your own environment. **Production** — the environment where the application is really used by people. **Preview or staging** — an environment for checking before the real launch; its existence alone does not guarantee a separate database.

**Migration** — a controlled change to the structure or state of data. **Backup** — a backup copy. **Restore** — recovery from it. **Rollback** — returning a change or version to an earlier state; data may require separate restoration.

**Log** — a record of application events. **Error** — an observable failure in how the application works. **Regression** — breakage of previously working behavior after changes.

**Linter** — a tool that checks rules and suspicious constructs. **Type checking** — checking that types are consistent according to the rules of the language. Neither of them proves that a user scenario is correct.

**Mock** — a controlled replacement for a real component in a test. **Coverage** — information about which code the tests executed. **Regression test** — a check that guards against the return of a known error.

**Abstraction** — a separated general concept or mechanism. **Refactoring** — changing internal structure while preserving behavior. **Technical debt** — decisions and obstacles that make later changes more expensive.

**Agent context** — the instructions, information, messages, and tool results available to the agent in its current work; this is not an infallible memory of the whole project. **MCP** — a protocol for connecting tools and context sources to AI applications; it does not guarantee that the model will use them.

The concepts are grouped by how they are used, not as a mandatory list to memorize. For further reading: [Questera](https://www.questera.ai/blogs/vibe-coders-glossary-50-terms), [Vibe Coder Blog](https://blog.vibecoder.me/vibe-coding-vocabulary-every-term-you-need), [Explore AI Together](https://exploreaitogether.com/vibe-coding-terms/). The commit/push distinction is clarified by [Git commit](https://git-scm.com/docs/git-commit) and [Git push](https://git-scm.com/docs/git-push).

**Section sources:** [53](#source-53), [54](#source-54), [55](#source-55), [56](#source-56), [57](#source-57), [63](#source-63)

<a name="bibliography"></a>

## Sources

<a name="source-1"></a>

- **[1]** [Vibe engineering (Simon Willison)](https://simonwillison.net/2025/Oct/7/vibe-engineering/)

<a name="source-2"></a>

- **[2]** [5 Mistakes Beginners Make When Vibe Coding](https://pub.towardsai.net/5-mistakes-beginners-make-when-vibe-coding-and-how-to-avoid-them-de828f7a269a)

<a name="source-3"></a>

- **[3]** [How I manage AI as a Non-Developer](https://maximerumpler.substack.com/p/how-i-manage-ai-as-a-non-developer)

<a name="source-4"></a>

- **[4]** [Think Like a Tech Lead, Not a Coder](https://salesforcedevops.net/index.php/2025/06/04/the-secret-to-managing-ai-coding-agents/)

<a name="source-5"></a>

- **[5]** [Key AI Terms: Sycophancy (BYU-Idaho)](https://www.byui.edu/ai/training/syncophancy)

<a name="source-6"></a>

- **[6]** [Sycophancy-Free Coding: How to Make AI Agents Say "No"](https://dev.to/luca_morricone/sycophancy-free-coding-how-to-make-ai-agents-say-no-3l43)

<a name="source-8"></a>

- **[8]** [Solo Dev Survival Guide: Prototype Faster by Cutting Features](https://www.wayline.io/blog/solo-dev-prototype-faster)

<a name="source-9"></a>

- **[9]** [Vibe Coding Playbook for PMs](https://aispaces.substack.com/p/vibe-coding-playbook-for-pms)

<a name="source-10"></a>

- **[10]** [PRD для вайбкодинга (gist)](https://gist.github.com/gkossakowski/21cd41fc3801de9d7d0201e0792c7ded)

<a name="source-11"></a>

- **[11]** [How to write a good spec for AI agents (Addy Osmani)](https://addyosmani.com/blog/good-spec/)

<a name="source-12"></a>

- **[12]** [AI-Native Development: Specifications, Loop and Graph Engineering](https://alexeyondata.substack.com/p/ai-native-development-specifications)

<a name="source-13"></a>

- **[13]** [Spec-Driven Development in 2026: Future of AI Coding or Waterfall 2.0?](https://alexcloudstar.com/blog/spec-driven-development-2026/)

<a name="source-14"></a>

- **[14]** [A non-technical guide for how code works (Ben's Bites)](https://www.bensbites.com/p/a-non-technical-guide-for-how-code-works)

<a name="source-16"></a>

- **[16]** [Clean Up Your Vibe-Coded Codebase Without Breaking It](https://nelsonxlee.substack.com/p/clean-up-your-vibe-coded-codebase)

<a name="source-17"></a>

- **[17]** [Why I keep my frontend and backend separate](https://dev.to/aditya_sorathiya_069252f4/why-i-keep-my-frontend-and-backend-separate-even-in-the-same-repository-390j)

<a name="source-18"></a>

- **[18]** [Scaling Your Vibe: Architecting Large Projects](https://dev.to/futureim/scaling-your-vibe-architecting-large-projects-with-futurex-2k4h)

<a name="source-19"></a>

- **[19]** [Mastering Backend Node.js Folder Structure](https://dev.to/jovickcoder/mastering-backend-nodejs-folder-structure-a-beginners-guide-2o2e)

<a name="source-20"></a>

- **[20]** [Understanding the Svelte Project Structure](https://codefinity.com/da/courses/v2/fb1ac3cf-b8c0-4d28-b4fa-bed1dfbba00b/47b754e0-60e2-4302-87df-d392d62966fc/f5588a3c-241a-4d86-ac9c-695dfccc217c)

<a name="source-21"></a>

- **[21]** [Git for Vibe Coders (BrainGrid)](https://www.braingrid.ai/blog/git-version-control-for-ai-builders)

<a name="source-22"></a>

- **[22]** [Version Control for Non-Developers: Git Basics](https://www.questera.ai/blogs/version-control-for-non-developers-git-basics-vibe-coders)

<a name="source-25"></a>

- **[25]** [Claude Code: Best practices for agentic coding (Anthropic)](https://www.anthropic.com/engineering/claude-code-best-practices)

<a name="source-26"></a>

- **[26]** [How to write a great agents.md (GitHub)](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)

<a name="source-27"></a>

- **[27]** [Stop Claude Code from over-engineering](https://mcp.directory/blog/stop-claude-code-over-engineering-2026)

<a name="source-28"></a>

- **[28]** [The Best Code Your Agent Writes Is the Code It Doesn't](https://agentconn.com/blog/best-code-agent-doesnt-write-2026)

<a name="source-29"></a>

- **[29]** [AI Makes Premature Optimization Effortless](https://arpitbhayani.me/notes/ai-makes-premature-optimization-effortless-leading-to-over-engineered-code/)

<a name="source-30"></a>

- **[30]** [Expensive and Slow for Small Changes (Cyfrin)](https://www.cyfrin.io/blog/expensive-and-slow-for-small-changes-why-ai-coding-agents-can-be-overkill)

<a name="source-31"></a>

- **[31]** [Abstraction bloat](https://agentpatterns.ai/patterns/anti-patterns/abstraction-bloat/)

<a name="source-32"></a>

- **[32]** [Agentic Debt](https://neilkakkar.com/agentic-debt.html)

<a name="source-33"></a>

- **[33]** [AI Coding Agent Says Tests Pass: Verify the Work](https://aident.ai/blog/verify-ai-coding-agent-tests-pass)

<a name="source-36"></a>

- **[36]** [Patterns: Proving It Works (Steve Kinney)](https://stevekinney.com/courses/ai-development-setup/patterns-for-proving-it-works)

<a name="source-37"></a>

- **[37]** [How to Verify AI Agent Work](https://bigideasdb.com/help/how-to-verify-ai-agent-work)

<a name="source-38"></a>

- **[38]** [Read the diff, not the summary](https://dev.to/eduzsh/read-the-diff-not-the-summary-20l1)

<a name="source-39"></a>

- **[39]** [What Is a Pull Request? A Non-Engineer's Guide](https://www.braingrid.ai/blog/what-is-a-pull-request-non-engineer-guide)

<a name="source-40"></a>

- **[40]** [Should You Still Review Your AI Agent's Code?](https://agentsroom.dev/blog/should-you-review-ai-agent-code)

<a name="source-41"></a>

- **[41]** [Reviewing code you didn't write (курс)](https://github.com/recklessop/ai-workflow-course/wiki/10-reviewing-code-you-didnt-write)

<a name="source-42"></a>

- **[42]** [More Simplification](https://fuguediaries.substack.com/p/pr-6-more-simplification)

<a name="source-43"></a>

- **[43]** [Technical Debt (Codegen glossary)](https://codegen.com/glossary/technical-debt/)

<a name="source-44"></a>

- **[44]** [Using AI to Build a Test Suite (13Labs)](https://www.13labs.au/blog/using-ai-to-build-a-test-suite)

<a name="source-45"></a>

- **[45]** [How to Test AI-Generated Code (SitePoint)](https://www.sitepoint.com/testing-ai-generated-code/)

<a name="source-46"></a>

- **[46]** [Why you shouldn't use AI to write your tests (Swizec)](https://swizec.com/blog/why-you-shouldnt-use-ai-to-write-your-tests/)

<a name="source-47"></a>

- **[47]** [Secure Vibe Coding Guide (Cloud Security Alliance)](https://cloudsecurityalliance.org/articles/secure-vibe-coding-guide)

<a name="source-50"></a>

- **[50]** [How Do You Know When to Refactor Your Code?](https://spin.atomicobject.com/when-to-refactor-code/)

<a name="source-51"></a>

- **[51]** [Don't DRY your code prematurely (Google Testing Blog)](https://testing.googleblog.com/2024/05/dont-dry-your-code-prematurely.html)

<a name="source-52"></a>

- **[52]** [Indie Dev's Scope Creep Roadmap](https://www.wayline.io/blog/indie-dev-scope-creep-roadmap)

<a name="source-53"></a>

- **[53]** [The Vibe Coder's Glossary: 50 Terms](https://www.questera.ai/blogs/vibe-coders-glossary-50-terms)

<a name="source-54"></a>

- **[54]** [Vibe Coding Vocabulary, Every Term You Need to Know](https://blog.vibecoder.me/vibe-coding-vocabulary-every-term-you-need)

<a name="source-55"></a>

- **[55]** [The Vibe Coder's Dictionary](https://exploreaitogether.com/vibe-coding-terms/)

<a name="source-56"></a>

- **[56]** [Git — git-commit](https://git-scm.com/docs/git-commit)

<a name="source-57"></a>

- **[57]** [Git — git-push](https://git-scm.com/docs/git-push)

<a name="source-58"></a>

- **[58]** [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

<a name="source-59"></a>

- **[59]** [OWASP — Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

<a name="source-60"></a>

- **[60]** [Martin Fowler — Refactoring](https://refactoring.com/)

<a name="source-61"></a>

- **[61]** [Brendan Gregg — The USE Method](https://www.brendangregg.com/usemethod.html)

<a name="source-62"></a>

- **[62]** [Google Testing Blog — Code Coverage Best Practices](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html)

<a name="source-63"></a>

- **[63]** [Model Context Protocol — Architecture overview](https://modelcontextprotocol.io/docs/learn/architecture)

---

Original editorial text: The Living Handbook. Licensed under [CC BY 4.0](LICENSE). Third-party works remain under their respective terms.
