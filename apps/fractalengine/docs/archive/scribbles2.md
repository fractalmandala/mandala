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

    // Force a 50/50 vertical layout split
    function getVerticalLayout(): number[] {
        return [50, 50];
    }

// Sync down to paneforge only when NOT dragging to avoid layout loop fights
$effect(() => {
    if (horizontalGroup && !dragging) {
        horizontalGroup.setLayout(getHorizontalLayout());
    }
});

$effect(() => {
    // Crucial: do not force layout overrides on the vertical sub-group 
    // while the user is actively dragging either pane slider.
    if (verticalGroup && !dragging && hasRight) {
        verticalGroup.setLayout([50, 50]);
    }
});

    // --- Layout Mutation Handlers ---
    function handleHorizontalLayoutChange(sizes: number[]): void {
        let index = 0;
        const updates: Partial<Record<'left' | 'leftSecondary' | 'right' | 'bottom', number>> = {};
        
        if (hasLeft) updates.left = sizes[index++];
        if (hasLeftSecondary) updates.leftSecondary = sizes[index++];
        
        index++; // Skip center index mapping
        
        if (hasRight) updates.right = sizes[index];

        if (dragging) {
            pendingSizes = { ...pendingSizes, ...updates };
        } else {
            workspaceLayout.syncSurfaceSizes(profile, updates);
        }
    }

    function handleVerticalLayoutChange(sizes: number[]): void {
        const updates = { bottom: sizes[1] }; 

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

        <!-- Center Main Workspace -->
        <Pane order={2} minSize={20}>
            <main class="workspace-shell__center">
                <div class="workspace-shell__surface workspace-shell__surface--center">{@render center()}</div>
            </main>
        </Pane>

        <!-- Right Sidebar Container -->
<!-- Right Sidebar Container -->
{#if hasRight}
    <PaneResizer onDraggingChange={handleDraggingChange} />
    <Pane 
        order={3} 
        defaultSize={workspaceLayout.size(profile, 'right')} 
        minSize={14} 
        maxSize={40}
        style="height: 100%; display: flex; flex-direction: column;"
    >
        
        <!-- Inner Vertical Split spanning the absolute height boundaries -->
        <PaneGroup bind:this={verticalGroup} direction="vertical" onLayoutChange={handleVerticalLayoutChange}>
            
            <!-- Right Sidebar Content (Top Half) -->
            <Pane order={0} defaultSize={50} minSize={10} style="display: flex; flex-direction: column; overflow: hidden;">
                <aside class="workspace-shell__surface workspace-shell__surface--right" aria-label="Inspector sidebar" style="height: 100%; overflow-y: auto;">
                    {@render right?.()}
                </aside>
            </Pane>
            
            <PaneResizer onDraggingChange={handleDraggingChange} />
            
            <!-- Bottom Content (Bottom Half) -->
            <Pane order={1} defaultSize={50} minSize={10} style="display: flex; flex-direction: column; overflow: hidden; background: white;">
                <div style="height: 100%; display: flex; align-items: center; justify-content: center; border-top: 1px solid #ccc;">
                    hi
                </div>
            </Pane>
            
        </PaneGroup>

    </Pane>
{/if}

    </PaneGroup>
</section>