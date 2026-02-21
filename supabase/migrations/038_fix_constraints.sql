-- Add unique constraint to platform_documents to support upsert
ALTER TABLE platform_documents 
ADD CONSTRAINT uq_platform_documents_type_title_chunk UNIQUE (document_type, title, chunk_index);

-- Verify platform_knowledge constraint (in case it was dropped)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_platform_knowledge_category_key'
    ) THEN
        ALTER TABLE platform_knowledge 
        ADD CONSTRAINT uq_platform_knowledge_category_key UNIQUE (category, key);
    END IF;
END $$;
