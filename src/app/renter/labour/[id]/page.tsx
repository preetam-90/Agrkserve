import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import LabourDetailClient from './LabourDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  // Assuming 'labour_profiles' or similar table, checking user_profiles joined or similar might be complex.
  // Let's assume a simple fetch from 'labour_profiles' if it exists, or 'user_profiles' if that's where names are.
  // Based on home page: supabase.from('labour_profiles').select('*', ...)

  const { data } = await supabase
    .from('labour_profiles')
    .select('full_name, skills, location_name')
    .eq('id', id)
    .single();

  if (!data) {
    return {
      title: 'Labour Profile Not Found - AgriServe',
    };
  }

  const skillsStr = Array.isArray(data.skills) ? data.skills.join(', ') : data.skills;

  return {
    title: `Hire ${data.full_name} - ${data.location_name || 'India'} | AgriServe`,
    description: `Hire skilled agricultural labour. Skills: ${skillsStr || 'General Farming'}. Verified profiles on AgriServe.`,
  };
}

export default async function LabourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await params;
  return <LabourDetailClient />;
}
