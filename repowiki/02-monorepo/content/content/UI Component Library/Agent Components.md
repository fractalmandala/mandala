# Agent Components

<cite>
**Referenced Files in This Document**
- [package.json](file://packages/fractal-svelte/package.json)
- [index.ts](file://packages/fractal-svelte/src/lib/index.ts)
- [agents/index.ts](file://packages/fractal-svelte/src/lib/components/agents/index.ts)
- [message/index.ts](file://packages/fractal-svelte/src/lib/components/agents/message/index.ts)
- [message-bubble/index.ts](file://packages/fractal-svelte/src/lib/components/agents/message-bubble/index.ts)
- [message-scroller/index.ts](file://packages/fractal-svelte/src/lib/components/agents/message-scroller/index.ts)
- [ai-sidebar/index.ts](file://packages/fractal-svelte/src/lib/components/agents/ai-sidebar/index.ts)
- [prompt-input/index.ts](file://packages/fractal-svelte/src/lib/components/agents/prompt-input/index.ts)
- [streaming-response/index.ts](file://packages/fractal-svelte/src/lib/components/agents/streaming-response/index.ts)
- [approval-card/index.ts](file://packages/fractal-svelte/src/lib/components/agents/approval-card/index.ts)
- [file-diff/index.ts](file://packages/fractal-svelte/src/lib/components/agents/file-diff/index.ts)
- [todo-list/index.ts](file://packages/fractal-svelte/src/lib/components/agents/todo-list/index.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document provides comprehensive documentation for AI agent interaction components designed for chat interfaces and real-time communication. It covers Message components (Message, MessageBubble, MessageScroller), AiSidebar for navigation and context management, StreamingResponse for live content updates, PromptInput for user input handling, ApprovalCard for decision workflows, FileDiff for code comparison, TodoList for task management, and FeedbackWidget for user feedback. The guide explains context management, state synchronization, real-time updates, accessibility considerations, and includes examples for chat interface implementation, streaming content rendering, and multi-agent conversation patterns.

## Project Structure
The agent components are part of the fractal-svelte package and are organized under src/lib/components/agents. The package exposes these components via a public API through index files and exports them from the main library entry point.

```mermaid
graph TB
A["fractal-svelte<br/>src/lib/index.ts"] --> B["components/agents/index.ts"]
B --> C["message/index.ts"]
B --> D["message-bubble/index.ts"]
B --> E["message-scroller/index.ts"]
B --> F["ai-sidebar/index.ts"]
B --> G["prompt-input/index.ts"]
B --> H["streaming-response/index.ts"]
B --> I["approval-card/index.ts"]
B --> J["file-diff/index.ts"]
B --> K["todo-list/index.ts"]
```

**Diagram sources**
- [index.ts:1-6](file://packages/fractal-svelte/src/lib/index.ts#L1-L6)
- [agents/index.ts:1-10](file://packages/fractal-svelte/src/lib/components/agents/index.ts#L1-L10)

**Section sources**
- [package.json:1-245](file://packages/fractal-svelte/package.json#L1-L245)
- [index.ts:1-6](file://packages/fractal-svelte/src/lib/index.ts#L1-L6)
- [agents/index.ts:1-10](file://packages/fractal-svelte/src/lib/components/agents/index.ts#L1-L10)

## Core Components
The agents module exports a cohesive set of components to build AI-driven chat experiences:

- Message family: Message, MessageGroup, MessageAvatar, MessageContent, MessageHeader, MessageFooter, MessageMarker, MessageTyping, plus re-exports of MessageBubble variants and MessageScroller.
- MessageBubble family: MessageBubble, MessageBubbleContent, MessageBubbleGroup, MessageBubbleCollapsible with variant and alignment types.
- MessageScroller: scrollable container optimized for message lists.
- AiSidebar: navigation and context panel for agent resources and actions.
- PromptInput: user input field with model and action typing support.
- StreamingResponse: live content renderer with status and feedback types.
- ApprovalCard: decision workflow UI with typed options and answers.
- FileDiff: code diff viewer with typed line and status models.
- TodoList: task list with typed items and statuses.

These components are exported from their respective index files and re-exported centrally for easy consumption.

**Section sources**
- [message/index.ts:1-17](file://packages/fractal-svelte/src/lib/components/agents/message/index.ts#L1-L17)
- [message-bubble/index.ts:1-6](file://packages/fractal-svelte/src/lib/components/agents/message-bubble/index.ts#L1-L6)
- [message-scroller/index.ts:1-2](file://packages/fractal-svelte/src/lib/components/agents/message-scroller/index.ts#L1-L2)
- [ai-sidebar/index.ts:1-8](file://packages/fractal-svelte/src/lib/components/agents/ai-sidebar/index.ts#L1-L8)
- [prompt-input/index.ts:1-3](file://packages/fractal-svelte/src/lib/components/agents/prompt-input/index.ts#L1-L3)
- [streaming-response/index.ts:1-7](file://packages/fractal-svelte/src/lib/components/agents/streaming-response/index.ts#L1-L7)
- [approval-card/index.ts:1-9](file://packages/fractal-svelte/src/lib/components/agents/approval-card/index.ts#L1-L9)
- [file-diff/index.ts:1-3](file://packages/fractal-svelte/src/lib/components/agents/file-diff/index.ts#L1-L3)
- [todo-list/index.ts:1-3](file://packages/fractal-svelte/src/lib/components/agents/todo-list/index.ts#L1-L3)

## Architecture Overview
The agent components follow a modular architecture where each feature is encapsulated in its own directory with an index file exporting the component and related types. The central agents index aggregates these exports, enabling consumers to import only what they need.

```mermaid
classDiagram
class Message {
+props
+events
}
class MessageBubble {
+variant
+align
}
class MessageScroller {
+scrollBehavior
+autoScroll
}
class AISidebar {
+resources
+actions
}
class PromptInput {
+model
+action
}
class StreamingResponse {
+status
+feedback
}
class ApprovalCard {
+question
+options
+answers
}
class FileDiff {
+lines
+status
}
class TodoList {
+items
+statuses
}
Message --> MessageBubble : "renders"
Message --> MessageScroller : "scrolls within"
AISidebar --> PromptInput : "hosts"
StreamingResponse --> ApprovalCard : "may trigger"
FileDiff --> TodoList : "task tracking"
```

[No sources needed since this diagram shows conceptual relationships]

## Detailed Component Analysis

### Message Components
The Message family provides a rich composition model for chat messages. It includes avatar, header, content, footer, marker, and typing indicators, along with bubble variants and grouping utilities.

```mermaid
classDiagram
class Message {
+from
+content
+header
+footer
+marker
+typing
}
class MessageGroup {
+messages
}
class MessageAvatar {
+src
+alt
}
class MessageContent {
+text
+renderers
}
class MessageHeader {
+sender
+timestamp
}
class MessageFooter {
+actions
}
class MessageMarker {
+type
}
class MessageTyping {
+active
}
class MessageBubble {
+variant
+align
}
class MessageBubbleContent {
+children
}
class MessageBubbleGroup {
+items
}
class MessageBubbleCollapsible {
+collapsed
}
Message --> MessageGroup : "groups"
Message --> MessageAvatar : "displays"
Message --> MessageContent : "renders"
Message --> MessageHeader : "shows"
Message --> MessageFooter : "includes"
Message --> MessageMarker : "marks"
Message --> MessageTyping : "indicates"
Message --> MessageBubble : "uses bubble layout"
```

**Diagram sources**
- [message/index.ts:1-17](file://packages/fractal-svelte/src/lib/components/agents/message/index.ts#L1-L17)
- [message-bubble/index.ts:1-6](file://packages/fractal-svelte/src/lib/components/agents/message-bubble/index.ts#L1-L6)

**Section sources**
- [message/index.ts:1-17](file://packages/fractal-svelte/src/lib/components/agents/message/index.ts#L1-L17)
- [message-bubble/index.ts:1-6](file://packages/fractal-svelte/src/lib/components/agents/message-bubble/index.ts#L1-L6)

### MessageScroller
MessageScroller provides efficient scrolling behavior for long message lists, supporting auto-scroll and custom scroll behaviors.

```mermaid
flowchart TD
Start(["Mount"]) --> Init["Initialize scroll state"]
Init --> Observe{"Observe new messages?"}
Observe --> |Yes| Update["Update scroll position"]
Observe --> |No| Idle["Idle"]
Update --> AutoScroll{"Auto-scroll enabled?"}
AutoScroll --> |Yes| ScrollToBottom["Scroll to bottom"]
AutoScroll --> |No| KeepPosition["Keep current position"]
ScrollToBottom --> End(["Render"])
KeepPosition --> End
Idle --> End
```

**Diagram sources**
- [message-scroller/index.ts:1-2](file://packages/fractal-svelte/src/lib/components/agents/message-scroller/index.ts#L1-L2)

**Section sources**
- [message-scroller/index.ts:1-2](file://packages/fractal-svelte/src/lib/components/agents/message-scroller/index.ts#L1-L2)

### AiSidebar
AiSidebar serves as a navigation and context management panel for agent resources and actions. It supports typed resource kinds and move operations.

```mermaid
sequenceDiagram
participant User as "User"
participant Sidebar as "AiSidebar"
participant Context as "Context Store"
participant Actions as "Action Handlers"
User->>Sidebar : Open sidebar
Sidebar->>Context : Load resources
Context-->>Sidebar : Resources list
User->>Sidebar : Select resource
Sidebar->>Actions : Trigger action
Actions-->>Sidebar : Update state
Sidebar-->>User : Reflect changes
```

**Diagram sources**
- [ai-sidebar/index.ts:1-8](file://packages/fractal-svelte/src/lib/components/agents/ai-sidebar/index.ts#L1-L8)

**Section sources**
- [ai-sidebar/index.ts:1-8](file://packages/fractal-svelte/src/lib/components/agents/ai-sidebar/index.ts#L1-L8)

### PromptInput
PromptInput handles user input with support for model selection and action dispatching. It exposes typed models and actions for integration with agent systems.

```mermaid
flowchart TD
Input["User types prompt"] --> Validate["Validate input"]
Validate --> Valid{"Valid?"}
Valid --> |No| Error["Show error"]
Valid --> |Yes| Dispatch["Dispatch action"]
Dispatch --> ModelSelect{"Model selected?"}
ModelSelect --> |Yes| SetModel["Set model"]
ModelSelect --> |No| DefaultModel["Use default model"]
SetModel --> Send["Send to agent"]
DefaultModel --> Send
Send --> Response["Receive response"]
Response --> Update["Update UI"]
```

**Diagram sources**
- [prompt-input/index.ts:1-3](file://packages/fractal-svelte/src/lib/components/agents/prompt-input/index.ts#L1-L3)

**Section sources**
- [prompt-input/index.ts:1-3](file://packages/fractal-svelte/src/lib/components/agents/prompt-input/index.ts#L1-L3)

### StreamingResponse
StreamingResponse renders live content updates with status management and feedback collection. It supports citation items and various response states.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Stream as "StreamingResponse"
participant Source as "Data Source"
participant Feedback as "Feedback Handler"
Client->>Stream : Start stream
Stream->>Source : Subscribe to events
Source-->>Stream : Chunk data
Stream-->>Client : Render partial content
Client->>Stream : Provide feedback
Stream->>Feedback : Process feedback
Source-->>Stream : Complete signal
Stream-->>Client : Finalize display
```

**Diagram sources**
- [streaming-response/index.ts:1-7](file://packages/fractal-svelte/src/lib/components/agents/streaming-response/index.ts#L1-L7)

**Section sources**
- [streaming-response/index.ts:1-7](file://packages/fractal-svelte/src/lib/components/agents/streaming-response/index.ts#L1-L7)

### ApprovalCard
ApprovalCard facilitates decision workflows by presenting questions with multiple options and collecting answers.

```mermaid
flowchart TD
Question["Display question"] --> Options["Show options"]
Options --> Selection{"User selects option"}
Selection --> Validate["Validate answer"]
Validate --> Valid{"Valid?"}
Valid --> |No| Retry["Retry selection"]
Valid --> |Yes| Submit["Submit answer"]
Submit --> Confirm["Confirm decision"]
Confirm --> Next["Proceed to next step"]
```

**Diagram sources**
- [approval-card/index.ts:1-9](file://packages/fractal-svelte/src/lib/components/agents/approval-card/index.ts#L1-L9)

**Section sources**
- [approval-card/index.ts:1-9](file://packages/fractal-svelte/src/lib/components/agents/approval-card/index.ts#L1-L9)

### FileDiff
FileDiff displays code differences with typed line structures and status indicators for added, removed, or modified content.

```mermaid
classDiagram
class FileDiff {
+lines
+status
}
class FileDiffLine {
+content
+status
+lineNumber
}
class FileDiffStatus {
+added
+removed
+modified
}
FileDiff --> FileDiffLine : "contains"
FileDiffLine --> FileDiffStatus : "has status"
```

**Diagram sources**
- [file-diff/index.ts:1-3](file://packages/fractal-svelte/src/lib/components/agents/file-diff/index.ts#L1-L3)

**Section sources**
- [file-diff/index.ts:1-3](file://packages/fractal-svelte/src/lib/components/agents/file-diff/index.ts#L1-L3)

### TodoList
TodoList manages task items with different statuses, supporting completion, deletion, and reordering.

```mermaid
flowchart TD
Add["Add new task"] --> List["Update task list"]
List --> Display["Display tasks"]
Display --> Action{"User action"}
Action --> |Complete| MarkComplete["Mark as complete"]
Action --> |Delete| RemoveTask["Remove task"]
Action --> |Edit| EditTask["Edit task"]
MarkComplete --> Update["Update state"]
RemoveTask --> Update
EditTask --> Update
Update --> Re-render["Re-render list"]
```

**Diagram sources**
- [todo-list/index.ts:1-3](file://packages/fractal-svelte/src/lib/components/agents/todo-list/index.ts#L1-L3)

**Section sources**
- [todo-list/index.ts:1-3](file://packages/fractal-svelte/src/lib/components/agents/todo-list/index.ts#L1-L3)

## Dependency Analysis
The agent components have minimal external dependencies, primarily relying on Svelte 5 and motion primitives. The package structure ensures loose coupling between components while maintaining clear export boundaries.

```mermaid
graph TB
Package["fractal-svelte package"] --> Agents["agents/index.ts"]
Agents --> Message["message/index.ts"]
Agents --> Bubble["message-bubble/index.ts"]
Agents --> Scroller["message-scroller/index.ts"]
Agents --> Sidebar["ai-sidebar/index.ts"]
Agents --> Input["prompt-input/index.ts"]
Agents --> Stream["streaming-response/index.ts"]
Agents --> Approval["approval-card/index.ts"]
Agents --> Diff["file-diff/index.ts"]
Agents --> Todo["todo-list/index.ts"]
subgraph "External Dependencies"
Svelte["Svelte 5"]
Motion["@humanspeak/svelte-motion"]
end
Package --> Svelte
Package --> Motion
```

**Diagram sources**
- [package.json:215-218](file://packages/fractal-svelte/package.json#L215-L218)
- [agents/index.ts:1-10](file://packages/fractal-svelte/src/lib/components/agents/index.ts#L1-L10)

**Section sources**
- [package.json:215-218](file://packages/fractal-svelte/package.json#L215-L218)
- [agents/index.ts:1-10](file://packages/fractal-svelte/src/lib/components/agents/index.ts#L1-L10)

## Performance Considerations
- **Virtualization**: For large message lists, consider implementing virtual scrolling in MessageScroller to improve performance.
- **Memoization**: Use Svelte's reactive statements and stores to minimize unnecessary re-renders.
- **Streaming Optimization**: Implement chunked processing in StreamingResponse to handle large data streams efficiently.
- **Memory Management**: Clean up event listeners and subscriptions when components unmount.
- **Accessibility**: Ensure all interactive elements have proper ARIA labels and keyboard navigation support.

## Troubleshooting Guide
Common issues and solutions:

- **Message Rendering Issues**: Verify that message props are correctly structured and that content renderers are properly configured.
- **Streaming Delays**: Check network connectivity and ensure proper error handling in StreamingResponse.
- **Sidebar State Sync**: Confirm that context updates are properly propagated to dependent components.
- **Input Validation**: Ensure PromptInput validation rules match expected agent requirements.
- **Diff Rendering**: Verify that FileDiff line structures contain required properties for accurate rendering.

## Conclusion
The agent components provide a comprehensive toolkit for building AI-powered chat interfaces with real-time capabilities. The modular design allows for flexible composition while maintaining type safety and accessibility standards. By following the patterns outlined in this document, developers can create responsive, accessible, and performant AI agent interactions.

## Appendices

### Chat Interface Implementation Example
A typical chat interface combines Message, MessageScroller, and PromptInput components:

```mermaid
sequenceDiagram
participant User as "User"
participant Chat as "Chat Container"
participant Input as "PromptInput"
participant Messages as "Message List"
participant Stream as "StreamingResponse"
User->>Input : Type message
Input->>Chat : Submit prompt
Chat->>Messages : Add user message
Chat->>Stream : Start streaming
Stream-->>Messages : Update AI response
Messages-->>User : Display conversation
```

### Multi-Agent Conversation Pattern
For multi-agent scenarios, use AiSidebar to manage different agent contexts and Message components to distinguish between agents:

```mermaid
flowchart TD
Context["Agent Context"] --> Router["Message Router"]
Router --> AgentA["Agent A Handler"]
Router --> AgentB["Agent B Handler"]
AgentA --> ResponseA["Agent A Response"]
AgentB --> ResponseB["Agent B Response"]
ResponseA --> Message["Message Component"]
ResponseB --> Message
Message --> Display["Chat Display"]
```

### Accessibility Best Practices
- Use semantic HTML elements within components
- Implement proper focus management
- Provide screen reader announcements for dynamic content
- Ensure sufficient color contrast
- Support keyboard navigation throughout the interface