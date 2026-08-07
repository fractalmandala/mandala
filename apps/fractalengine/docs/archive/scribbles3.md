```
<script lang="ts">
    import { Pane, PaneGroup, PaneResizer, type PaneGroupAPI } from 'paneforge';
    import type { Snippet } from 'svelte';
    import { workspaceLayout, type WorkspaceProfileId } from '$lib/state/workspaceLayout.svelte';

    interface Props {
        profile: WorkspaceProfileId;
        left?: Snippet;
        leftSecondary?: Snippet;
        center: Snippet;
        right?: Snippet;
        bottom?: Snippet
    }

    let { profile, left, leftSecondary, center, right, bottom }: Props = $props();
    
    let horizontalGroup = $state<PaneGroupAPI | null>(null);
    let verticalGroup = $state<PaneGroupAPI | null>(null);
    let dragging = $state(false);
    let pendingSizes = $state<Partial<Record<'left' | 'leftSecondary' | 'right' | 'bottom', number>>>({});

    const hasLeft = $derived(Boolean(left));
    const hasLeftSecondary = $derived(Boolean(leftSecondary));
    const hasRight = $derived(Boolean(right));
    const hasBottom = $derived(Boolean(bottom));

    // --- Horizontal Layout Calculations ---
    function getHorizontalLayout(): number[] {
        const leftSize = hasLeft && !workspaceLayout.isCollapsed(profile, 'left') ? workspaceLayout.size(profile, 'left') : 0;
        const leftSecSize = hasLeftSecondary && !workspaceLayout.isCollapsed(profile, 'leftSecondary') ? workspaceLayout.size(profile, 'leftSecondary') : 0;
        const rightSize = hasRight && !workspaceLayout.isCollapsed(profile, 'right') ? workspaceLayout.size(profile, 'right') : 0;
        
        const centerSize = 100 - leftSize - leftSecSize - rightSize;
        
        const sizes: number[] = [];
        if (hasLeft) sizes.push(leftSize);
        if (hasLeftSecondary) sizes.push(leftSecSize);
        sizes.push(centerSize);
        if (hasRight) sizes.push(rightSize);
        return sizes;
    }

    // --- Vertical Layout Calculations ---
    function getVerticalLayout(): number[] {
        if (!hasBottom) return [100];
        const bottomSize = !workspaceLayout.isCollapsed(profile, 'bottom') ? workspaceLayout.size(profile, 'bottom') : 0;
        return [100 - bottomSize, bottomSize];
    }

    // Sync state down to paneforge instances when external layout changes
    $effect(() => {
        if (horizontalGroup && !dragging) {
            horizontalGroup.setLayout(getHorizontalLayout());
        }
    });

    $effect(() => {
        if (verticalGroup && !dragging && hasBottom) {
			verticalGroup.setLayout(getVerticalLayout());
		}
    });

    // --- Layout Mutation Handlers ---
    function handleHorizontalLayoutChange(sizes: number[]): void {
        let index = 0;
        const updates: Partial<Record<'left' | 'leftSecondary' | 'right' | 'bottom', number>> = {};
        
        if (hasLeft) updates.left = sizes[index++];
        if (hasLeftSecondary) updates.leftSecondary = sizes[index++];
        
        index++; // Skip center container index mapping
        
        if (hasRight) updates.right = sizes[index];

        if (dragging) {
            pendingSizes = { ...pendingSizes, ...updates };
        } else {
            workspaceLayout.syncSurfaceSizes(profile, updates);
        }
    }

    function handleVerticalLayoutChange(sizes: number[]): void {
        if (!hasBottom) return;
        const updates = { bottom: sizes[1] }; // Index 0 is Center, Index 1 is Bottom
        if (dragging) {
            pendingSizes = { ...pendingSizes, ...updates };
        } else {
            workspaceLayout.syncSurfaceSizes(profile, updates);
        }
    }

    function handleDraggingChange(nextDragging: boolean): void {
        if (nextDragging) {
            dragging = true;
            pendingSizes = {};
            workspaceLayout.beginGesture();
            return;
        }
        dragging = false;
        workspaceLayout.syncSurfaceSizes(profile, pendingSizes);
        pendingSizes = {};
        workspaceLayout.endGesture();
    }
</script>

<section class="workspace-shell" aria-label="Workspace">
    <!-- Outer Horizontal Group -->
    <PaneGroup bind:this={horizontalGroup} direction="horizontal" keyboardResizeBy={2} onLayoutChange={handleHorizontalLayoutChange}>
        
        <!-- Left Sidebar -->
        {#if hasLeft}
            <Pane order={0} defaultSize={workspaceLayout.size(profile, 'left')} minSize={12} maxSize={36} collapsible collapsedSize={0} onCollapse={() => workspaceLayout.setCollapsed(profile, 'left', true)} onExpand={() => workspaceLayout.setCollapsed(profile, 'left', false)}>
                <aside class="workspace-shell__surface workspace-shell__surface--left" aria-label="Primary sidebar">{@render left?.()}</aside>
            </Pane>
            <PaneResizer onDraggingChange={handleDraggingChange} />
        {/if}

        <!-- Left Secondary Sidebar -->
        {#if hasLeftSecondary}
            <Pane order={1} defaultSize={workspaceLayout.size(profile, 'leftSecondary')} minSize={14} maxSize={38} collapsible collapsedSize={0} onCollapse={() => workspaceLayout.setCollapsed(profile, 'leftSecondary', true)} onExpand={() => workspaceLayout.setCollapsed(profile, 'leftSecondary', false)}>
                <aside class="workspace-shell__surface workspace-shell__surface--left-secondary" aria-label="Secondary sidebar">{@render leftSecondary?.()}</aside>
            </Pane>
            <PaneResizer onDraggingChange={handleDraggingChange} />
        {/if}

        <!-- Center Container (Holds Center Main AND Bottom via vertical nesting) -->
        <Pane order={2} minSize={20}>
            {#if hasBottom}
                <PaneGroup bind:this={verticalGroup} direction="vertical" onLayoutChange={handleVerticalLayoutChange}>
                    <!-- Inner Top / Center Main -->
                    <Pane order={0} minSize={20}>
                        <main class="workspace-shell__center">
                            <div class="workspace-shell__surface workspace-shell__surface--center">{@render center()}</div>
                        </main>
                    </Pane>
                    
                    <PaneResizer onDraggingChange={handleDraggingChange} />
                    
                    <!-- Inner Bottom -->
                    <Pane order={1} defaultSize={workspaceLayout.size(profile, 'bottom')} minSize={10} maxSize={50} collapsible collapsedSize={0} onCollapse={() => workspaceLayout.setCollapsed(profile, 'bottom', true)} onExpand={() => workspaceLayout.setCollapsed(profile, 'bottom', false)}>
                        <footer class="workspace-shell__surface workspace-shell__surface--bottom" aria-label="Bottom panel">{@render bottom?.()}</footer>
                    </Pane>
                </PaneGroup>
            {:else}
                <!-- Fallback if there is no bottom panel at all -->
                <main class="workspace-shell__center">
                    <div class="workspace-shell__surface workspace-shell__surface--center">{@render center()}</div>
                </main>
            {/if}
        </Pane>

        <!-- Right Sidebar -->
            <PaneResizer onDraggingChange={handleDraggingChange} />
            <Pane order={3} defaultSize={workspaceLayout.size(profile, 'right')} minSize={14} maxSize={40} collapsible collapsedSize={0} onCollapse={() => workspaceLayout.setCollapsed(profile, 'right', true)} onExpand={() => workspaceLayout.setCollapsed(profile, 'right', false)}>
                <aside class="workspace-shell__surface workspace-shell__surface--right" aria-label="Inspector sidebar">{@render right?.()}</aside>
            </Pane>

    </PaneGroup>
</section>
```