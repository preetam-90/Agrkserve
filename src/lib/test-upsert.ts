import { upsertPlatformKnowledge } from './services/platform-knowledge-service';

async function test() {
    console.log('Testing upsertPlatformKnowledge...');
    const result = await upsertPlatformKnowledge({
        category: 'metadata',
        key: 'system_info',
        data: {
            knowledge_base_version: "1.0.0",
            last_updated: new Date().toISOString(),
            test: true
        },
        description: 'Diagnostic test skip',
        is_active: true
    });

    if (result.success) {
        console.log('✅ Success:', result.data);
    } else {
        console.error('❌ Failed:', result.error);
    }
}

test();
