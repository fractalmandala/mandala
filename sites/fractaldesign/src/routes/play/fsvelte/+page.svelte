<script lang="ts">
	import * as Accordion from 'fractalsvelte/accordion';
</script>

<Accordion.Root type="single" value="item-1" class="accordion-root">
	<Accordion.Item value="item-1" class="accordion-item">
		<Accordion.Trigger>Product Information</Accordion.Trigger>
		<Accordion.Content>Details about the product.</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
