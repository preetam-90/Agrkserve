import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/lib/services/embedding-service';
import { searchKnowledge } from '@/lib/services/knowledge-service';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SmartQueryResult {
  context: string;
  sources: string[];
  hasContext: boolean;
  /** @deprecated Use `hasContext` instead. Kept for backward compatibility. */
  hasData: boolean;
  queryType: string;
  dataFreshness: string;
}

export interface SmartQueryUserContext {
  userId?: string;
  roles?: string[];
  activeRole?: string;
  isAdmin?: boolean;
}

type IntentType =
  | 'count_equipment'
  | 'count_equipment_category'
  | 'list_equipment'
  | 'list_equipment_category'
  | 'search_equipment'
  | 'available_equipment'
  | 'count_labour'
  | 'list_labour'
  | 'available_labour'
  | 'count_users'
  | 'list_users'
  | 'count_reviews'
  | 'list_reviews'
  | 'reviews_for_equipment'
  | 'count_bookings'
  | 'list_bookings'
  | 'booking_status'
  | 'platform_stats'
  | 'my_bookings'
  | 'my_equipment'
  | 'my_profile'
  | 'my_reviews'
  | 'my_booking_status'
  | 'analytics_most_rented'
  | 'analytics_revenue'
  | 'analytics_idle_equipment'
  | 'analytics_overview'
  | 'vector_search';

interface DetectedIntent {
  type: IntentType;
  category?: string;
  searchTerm?: string;
  status?: string;
}

const EQUIPMENT_CATEGORIES = [
  'tractor',
  'harvester',
  'plough',
  'cultivator',
  'rotavator',
  'thresher',
  'sprayer',
  'seeder',
  'irrigation',
  'drone',
  'other',
] as const;

// ─── Intent Detection ────────────────────────────────────────────────────────

function detectIntent(message: string): DetectedIntent {
  const msg = message.toLowerCase().trim();

  // Empty or very short queries → vector search fallback
  if (msg.length < 2) {
    return { type: 'vector_search' };
  }

  // ── Platform stats ──
  if (
    /\b(platform\s*(stats|statistics|summary|overview|data|numbers))\b/.test(msg) ||
    /\b(overall\s*(stats|statistics|summary|overview))\b/.test(msg) ||
    /\b(dashboard\s*(stats|data|summary))\b/.test(msg) ||
    /^(stats|statistics|summary|overview)$/.test(msg)
  ) {
    return { type: 'platform_stats' };
  }

  // ── User's personal data intents (checked FIRST, before general patterns) ──

  // My bookings with status filter
  if (
    /\b(my|mine)\b/.test(msg) &&
    /\b(booking|reservation|order|rental)\b/.test(msg) &&
    /\b(pending|confirmed|in.?progress|completed|cancelled|canceled)\b/.test(msg)
  ) {
    const statusMatch = msg.match(
      /\b(pending|confirmed|in.?progress|completed|cancelled|canceled)\b/
    );
    if (statusMatch) {
      const status = statusMatch[1].replace('canceled', 'cancelled').replace(/\s+/g, '_');
      return { type: 'my_booking_status', status };
    }
  }

  // My bookings (general)
  if (/\b(my|mine)\b/.test(msg) && /\b(booking|reservation|order|rental)\b/.test(msg)) {
    return { type: 'my_bookings' };
  }

  // My equipment
  if (/\b(my|mine)\b/.test(msg) && /\b(equipment|machine|tractor|listing)\b/.test(msg)) {
    return { type: 'my_equipment' };
  }

  // My profile
  if (/\b(my|mine)\b/.test(msg) && /\b(profile|account|details|info)\b/.test(msg)) {
    return { type: 'my_profile' };
  }

  // My reviews
  if (/\b(my|mine)\b/.test(msg) && /\b(review|rating|feedback)\b/.test(msg)) {
    return { type: 'my_reviews' };
  }

  // ── Admin analytics intents ──
  if (/\b(analytics|insights|business|admin)\b/.test(msg)) {
    if (/\b(most\s+rented|popular|top\s+(?:rented|booked))\b/.test(msg)) {
      return { type: 'analytics_most_rented' };
    }
    if (/\b(revenue|earnings|income|money)\b/.test(msg)) {
      return { type: 'analytics_revenue' };
    }
    if (/\b(idle|unused|inactive|unbooked)\b/.test(msg)) {
      return { type: 'analytics_idle_equipment' };
    }
    return { type: 'analytics_overview' };
  }

  // ── Equipment by category (count) ──
  for (const category of EQUIPMENT_CATEGORIES) {
    const plural = category === 'plough' ? 'ploughs' : category + 's';
    const catPattern = new RegExp(
      `\\b(how\\s+many|count|number\\s+of|total)\\s+(${category}|${plural})\\b`
    );
    if (catPattern.test(msg)) {
      return { type: 'count_equipment_category', category };
    }
    // Also match "tractors count" / "tractors total"
    const reversePattern = new RegExp(`\\b(${category}|${plural})\\s+(count|total|number)\\b`);
    if (reversePattern.test(msg)) {
      return { type: 'count_equipment_category', category };
    }
  }

  // ── Equipment by category (list) ──
  for (const category of EQUIPMENT_CATEGORIES) {
    const plural = category === 'plough' ? 'ploughs' : category + 's';
    const listPattern = new RegExp(
      `\\b(list|show|get|fetch|display|all|what are the)\\s+(all\\s+)?(${category}|${plural})\\b`
    );
    if (listPattern.test(msg)) {
      return { type: 'list_equipment_category', category };
    }
    // "tractors list" / "tractors available"
    const reverseList = new RegExp(`\\b(${category}|${plural})\\s+(list|available)\\b`);
    if (reverseList.test(msg)) {
      return { type: 'list_equipment_category', category };
    }
  }

  // ── Count all equipment ──
  if (
    /\b(how\s+many|count|number\s+of|total)\s+(equipment|machines|machinery|tools|items)\b/.test(
      msg
    ) ||
    /\b(equipment|machines|machinery)\s+(count|total|number)\b/.test(msg)
  ) {
    return { type: 'count_equipment' };
  }

  // ── List all equipment ──
  if (
    /\b(list|show|get|fetch|display|all)\s+(all\s+)?(equipment|machines|machinery|tools|items)\b/.test(
      msg
    ) ||
    /\b(what\s+(equipment|machines|machinery)\s+(do\s+we|are|is)\s+(have|available|listed|there))\b/.test(
      msg
    ) ||
    /\b(equipment|machines|machinery)\s+(list|catalog|catalogue|inventory)\b/.test(msg)
  ) {
    return { type: 'list_equipment' };
  }

  // ── Available equipment ──
  if (
    /\b(available|free|ready)\s+(equipment|machines|machinery)\b/.test(msg) ||
    /\b(equipment|machines|machinery)\s+(available|free|ready|for\s+rent)\b/.test(msg) ||
    /\bwhat\s+(is|are)\s+available\b/.test(msg)
  ) {
    return { type: 'available_equipment' };
  }

  // ── Search specific equipment by name ──
  const aboutEquipMatch = msg.match(
    /\b(?:tell\s+me\s+about|details?\s+(?:of|about|for)|info\s+(?:on|about)|what\s+(?:is|about)|search\s+(?:for)?|find)\s+(?:the\s+)?(.+?)(?:\s+equipment)?$/
  );
  if (aboutEquipMatch) {
    const term = aboutEquipMatch[1].trim();
    // Only treat as equipment search if the term isn't another entity keyword
    if (term && !/\b(labour|labor|worker|user|review|booking)\b/.test(term)) {
      return { type: 'search_equipment', searchTerm: term };
    }
  }

  // ── Labour / Workers ──
  if (
    /\b(how\s+many|count|number\s+of|total)\s+(labour|labor|labourers|laborers|workers|labours)\b/.test(
      msg
    ) ||
    /\b(labour|labor|worker)\s+(count|total|number)\b/.test(msg)
  ) {
    return { type: 'count_labour' };
  }

  if (
    /\b(available|free|ready)\s+(labour|labor|labourers|laborers|workers)\b/.test(msg) ||
    /\b(labour|labor|labourers|laborers|workers)\s+(available|free|ready)\b/.test(msg) ||
    /\bwho\s+(?:is|are)\s+available\s+(?:for\s+)?(?:work|hire|labour|labor)\b/.test(msg)
  ) {
    return { type: 'available_labour' };
  }

  if (
    /\b(list|show|get|fetch|display|all)\s+(all\s+)?(labour|labor|labourers|laborers|workers)\b/.test(
      msg
    ) ||
    /\b(labour|labor|workers?)\s+(list|profiles?|directory)\b/.test(msg)
  ) {
    return { type: 'list_labour' };
  }

  // ── Users ──
  if (
    /\b(how\s+many|count|number\s+of|total)\s+(users?|members?|people|accounts?|customers?)\b/.test(
      msg
    ) ||
    /\b(users?|members?|accounts?)\s+(count|total|number)\b/.test(msg)
  ) {
    return { type: 'count_users' };
  }

  if (
    /\b(who\s+are\s+the\s+users|list\s+(all\s+)?users|show\s+(all\s+)?users|user\s+list|all\s+users|all\s+members)\b/.test(
      msg
    ) ||
    /\b(list|show|get|fetch|display)\s+(all\s+)?(users?|members?|accounts?|customers?)\b/.test(msg)
  ) {
    return { type: 'list_users' };
  }

  // ── Reviews ──
  const reviewForMatch = msg.match(
    /\b(?:reviews?\s+(?:for|of|about|on)|(?:feedback|rating[s]?)\s+(?:for|of|about|on))\s+(.+?)$/
  );
  if (reviewForMatch) {
    return { type: 'reviews_for_equipment', searchTerm: reviewForMatch[1].trim() };
  }

  if (
    /\b(how\s+many|count|number\s+of|total)\s+(reviews?|ratings?|feedback)\b/.test(msg) ||
    /\b(reviews?|ratings?|feedback)\s+(count|total|number)\b/.test(msg)
  ) {
    return { type: 'count_reviews' };
  }

  if (
    /\b(list|show|get|fetch|display|all|latest|recent)\s+(all\s+)?(reviews?|ratings?|feedback)\b/.test(
      msg
    ) ||
    /\b(reviews?|ratings?|feedback)\s+(list|all)\b/.test(msg)
  ) {
    return { type: 'list_reviews' };
  }

  // ── Bookings ──
  const bookingStatusMatch = msg.match(
    /\b(pending|confirmed|in.?progress|completed|cancelled|canceled)\s+(bookings?|reservations?|orders?)\b/
  );
  if (bookingStatusMatch) {
    const status = bookingStatusMatch[1].replace('canceled', 'cancelled').replace(/\s+/g, '_');
    return { type: 'booking_status', status };
  }
  const bookingStatusReverse = msg.match(
    /\b(bookings?|reservations?|orders?)\s+(?:that\s+are\s+|with\s+status\s+)?(pending|confirmed|in.?progress|completed|cancelled|canceled)\b/
  );
  if (bookingStatusReverse) {
    const status = bookingStatusReverse[2].replace('canceled', 'cancelled').replace(/\s+/g, '_');
    return { type: 'booking_status', status };
  }

  if (
    /\b(how\s+many|count|number\s+of|total)\s+(bookings?|reservations?|orders?|rentals?)\b/.test(
      msg
    ) ||
    /\b(bookings?|reservations?|orders?|rentals?)\s+(count|total|number)\b/.test(msg)
  ) {
    return { type: 'count_bookings' };
  }

  if (
    /\b(list|show|get|fetch|display|all|latest|recent)\s+(all\s+)?(bookings?|reservations?|orders?|rentals?)\b/.test(
      msg
    ) ||
    /\b(bookings?|reservations?|orders?|rentals?)\s+(list|all)\b/.test(msg)
  ) {
    return { type: 'list_bookings' };
  }

  // ── Fallback: vector similarity search ──
  return { type: 'vector_search' };
}

// ─── Formatting Helpers ──────────────────────────────────────────────────────

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return 'N/A';
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatRating(rating: number | null | undefined): string {
  if (rating == null) return 'N/A';
  return `${Number(rating).toFixed(1)}/5`;
}

function formatAvailability(isAvailable: boolean | null | undefined): string {
  return isAvailable ? '✅ Yes' : '❌ No';
}

function formatTimestamp(): string {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function truncate(str: string | null | undefined, maxLen: number = 60): string {
  if (!str) return 'N/A';
  return str.length > maxLen ? str.slice(0, maxLen - 3) + '...' : str;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── PII Helpers ─────────────────────────────────────────────────────────────

function maskEmail(email: string | null | undefined): string {
  if (!email) return 'N/A';
  const atIndex = email.indexOf('@');
  if (atIndex <= 2) return email.charAt(0) + '***' + email.slice(atIndex);
  return email.slice(0, 2) + '***' + email.slice(atIndex);
}

// ─── Platform Stats (appended to all results) ───────────────────────────────

interface PlatformStats {
  totalEquipment: number;
  totalUsers: number;
  totalLabour: number;
  totalReviews: number;
  totalBookings: number;
}

async function fetchPlatformStats(): Promise<PlatformStats> {
  const supabase = createAdminClient();

  const [equipRes, userRes, labourRes, reviewRes, bookingRes] = await Promise.all([
    supabase.from('equipment').select('id', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('labour_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('reviews').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
  ]);

  return {
    totalEquipment: equipRes.count ?? 0,
    totalUsers: userRes.count ?? 0,
    totalLabour: labourRes.count ?? 0,
    totalReviews: reviewRes.count ?? 0,
    totalBookings: bookingRes.count ?? 0,
  };
}

function formatPlatformStats(stats: PlatformStats): string {
  return [
    '',
    '--- Platform Summary ---',
    `Total Equipment: ${stats.totalEquipment}`,
    `Total Users: ${stats.totalUsers}`,
    `Total Labour Profiles: ${stats.totalLabour}`,
    `Total Reviews: ${stats.totalReviews}`,
    `Total Bookings: ${stats.totalBookings}`,
    `Last Updated: ${formatTimestamp()}`,
  ].join('\n');
}

// ─── Result Builder ──────────────────────────────────────────────────────────

function buildResult(
  context: string,
  sources: string[],
  hasContext: boolean,
  queryType: string,
  dataFreshness: string
): SmartQueryResult {
  return {
    context,
    sources,
    hasContext,
    hasData: hasContext,
    queryType,
    dataFreshness,
  };
}

function makeErrorResult(queryType: string, errorMessage: string): SmartQueryResult {
  return buildResult(
    [
      '=== PLATFORM DATA ===',
      '',
      `⚠️ Error: ${errorMessage}`,
      '',
      'The system encountered an issue fetching live data. Please try again.',
    ].join('\n'),
    ['error'],
    false,
    queryType,
    'real-time'
  );
}

function makeAuthRequiredResult(dataType: string): SmartQueryResult {
  return buildResult(
    `⚠️ You need to be logged in to view your ${dataType}. Please sign in first.`,
    [],
    false,
    `my_${dataType}`,
    'real-time'
  );
}

// ─── Query Handlers ──────────────────────────────────────────────────────────

async function handleCountEquipment(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from('equipment')
    .select('id', { count: 'exact', head: true });

  if (error) {
    return makeErrorResult('count_equipment', `Failed to count equipment: ${error.message}`);
  }

  const stats = await fetchPlatformStats();

  const context = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `📊 Equipment Count: ${count ?? 0} total equipment listed on the platform`,
    '',
    formatPlatformStats(stats),
  ].join('\n');

  return buildResult(
    context,
    ['equipment table (real-time count)'],
    true,
    'count_equipment',
    'real-time'
  );
}

async function handleCountEquipmentCategory(category: string): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { data, count, error } = await supabase
    .from('equipment')
    .select('id, name, brand, price_per_day, location_name, rating, is_available', {
      count: 'exact',
    })
    .eq('category', category)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(20);

  if (error) {
    return makeErrorResult(
      'count_equipment_category',
      `Failed to query ${category} equipment: ${error.message}`
    );
  }

  const plural = category === 'plough' ? 'ploughs' : category + 's';
  const lines: string[] = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `📊 Equipment Count: ${count ?? 0} ${plural} found on the platform`,
  ];

  if (data && data.length > 0) {
    lines.push('');
    lines.push('| # | Name | Brand | Price/Day | Location | Rating | Available |');
    lines.push('|---|------|-------|-----------|----------|--------|-----------|');

    data.forEach((item, idx) => {
      lines.push(
        `| ${idx + 1} | ${item.name || 'N/A'} | ${item.brand || 'N/A'} | ${formatCurrency(item.price_per_day)} | ${truncate(item.location_name, 20)} | ${formatRating(item.rating)} | ${formatAvailability(item.is_available)} |`
      );
    });

    if ((count ?? 0) > 20) {
      lines.push('');
      lines.push(`... and ${(count ?? 0) - 20} more ${plural}`);
    }
  }

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    [`equipment table filtered by category='${category}' (real-time)`],
    (count ?? 0) > 0,
    'count_equipment_category',
    'real-time'
  );
}

async function handleListEquipment(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { data, count, error } = await supabase
    .from('equipment')
    .select(
      'id, name, category, brand, model, price_per_day, price_per_hour, location_name, rating, review_count, is_available, horsepower, fuel_type, year',
      { count: 'exact' }
    )
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(30);

  if (error) {
    return makeErrorResult('list_equipment', `Failed to list equipment: ${error.message}`);
  }

  const lines: string[] = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `📊 Equipment Listing: ${count ?? 0} total equipment on the platform`,
  ];

  if (data && data.length > 0) {
    lines.push('');
    lines.push(
      '| # | Name | Category | Brand | Model | Price/Day | Price/Hr | Location | Rating | Reviews | Available |'
    );
    lines.push(
      '|---|------|----------|-------|-------|-----------|----------|----------|--------|---------|-----------|'
    );

    data.forEach((item, idx) => {
      lines.push(
        `| ${idx + 1} | ${item.name || 'N/A'} | ${item.category || 'N/A'} | ${item.brand || 'N/A'} | ${item.model || 'N/A'} | ${formatCurrency(item.price_per_day)} | ${formatCurrency(item.price_per_hour)} | ${truncate(item.location_name, 20)} | ${formatRating(item.rating)} | ${item.review_count ?? 0} | ${formatAvailability(item.is_available)} |`
      );
    });

    if ((count ?? 0) > 30) {
      lines.push('');
      lines.push(`... and ${(count ?? 0) - 30} more equipment items`);
    }
  } else {
    lines.push('');
    lines.push('No equipment found on the platform.');
  }

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    ['equipment table (real-time full listing)'],
    (data?.length ?? 0) > 0,
    'list_equipment',
    'real-time'
  );
}

async function handleListEquipmentCategory(category: string): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { data, count, error } = await supabase
    .from('equipment')
    .select(
      'id, name, brand, model, price_per_day, price_per_hour, location_name, rating, review_count, is_available, horsepower, fuel_type, year',
      { count: 'exact' }
    )
    .eq('category', category)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(30);

  if (error) {
    return makeErrorResult(
      'list_equipment_category',
      `Failed to list ${category} equipment: ${error.message}`
    );
  }

  const plural = category === 'plough' ? 'ploughs' : category + 's';
  const lines: string[] = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `📊 ${capitalize(category)} Listing: ${count ?? 0} ${plural} on the platform`,
  ];

  if (data && data.length > 0) {
    lines.push('');
    lines.push(
      '| # | Name | Brand | Model | Price/Day | Location | HP | Fuel | Rating | Available |'
    );
    lines.push(
      '|---|------|-------|-------|-----------|----------|----|------|--------|-----------|'
    );

    data.forEach((item, idx) => {
      lines.push(
        `| ${idx + 1} | ${item.name || 'N/A'} | ${item.brand || 'N/A'} | ${item.model || 'N/A'} | ${formatCurrency(item.price_per_day)} | ${truncate(item.location_name, 20)} | ${item.horsepower ?? 'N/A'} | ${item.fuel_type || 'N/A'} | ${formatRating(item.rating)} | ${formatAvailability(item.is_available)} |`
      );
    });

    if ((count ?? 0) > 30) {
      lines.push('');
      lines.push(`... and ${(count ?? 0) - 30} more ${plural}`);
    }
  } else {
    lines.push('');
    lines.push(`No ${plural} found on the platform.`);
  }

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    [`equipment table filtered by category='${category}' (real-time listing)`],
    (data?.length ?? 0) > 0,
    'list_equipment_category',
    'real-time'
  );
}

async function handleSearchEquipment(searchTerm: string): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('equipment')
    .select(
      'id, name, category, description, brand, model, price_per_day, price_per_hour, location_name, features, rating, review_count, is_available, horsepower, fuel_type, year, images'
    )
    .or(
      `name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`
    )
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(10);

  if (error) {
    return makeErrorResult('search_equipment', `Failed to search equipment: ${error.message}`);
  }

  const lines: string[] = ['=== PLATFORM DATA (Real-time) ===', ''];

  if (data && data.length > 0) {
    lines.push(`🔍 Search Results: ${data.length} equipment matching "${searchTerm}"`, '');

    data.forEach((item, idx) => {
      lines.push(`--- Equipment ${idx + 1}: ${item.name || 'N/A'} ---`);
      lines.push(`  Category: ${item.category || 'N/A'}`);
      lines.push(`  Brand: ${item.brand || 'N/A'}`);
      lines.push(`  Model: ${item.model || 'N/A'}`);
      lines.push(`  Description: ${truncate(item.description, 150)}`);
      lines.push(`  Price/Day: ${formatCurrency(item.price_per_day)}`);
      lines.push(`  Price/Hour: ${formatCurrency(item.price_per_hour)}`);
      lines.push(`  Location: ${item.location_name || 'N/A'}`);
      lines.push(`  Rating: ${formatRating(item.rating)} (${item.review_count ?? 0} reviews)`);
      lines.push(`  Available: ${formatAvailability(item.is_available)}`);
      if (item.horsepower) lines.push(`  Horsepower: ${item.horsepower} HP`);
      if (item.fuel_type) lines.push(`  Fuel Type: ${item.fuel_type}`);
      if (item.year) lines.push(`  Year: ${item.year}`);
      if (item.features && item.features.length > 0) {
        lines.push(`  Features: ${item.features.join(', ')}`);
      }
      lines.push('');
    });
  } else {
    lines.push(`🔍 No equipment found matching "${searchTerm}".`, '');
  }

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    [`equipment table search for "${searchTerm}" (real-time)`],
    (data?.length ?? 0) > 0,
    'search_equipment',
    'real-time'
  );
}

async function handleAvailableEquipment(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { data, count, error } = await supabase
    .from('equipment')
    .select('id, name, category, brand, price_per_day, location_name, rating, review_count', {
      count: 'exact',
    })
    .eq('is_available', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(30);

  if (error) {
    return makeErrorResult(
      'available_equipment',
      `Failed to query available equipment: ${error.message}`
    );
  }

  const lines: string[] = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `✅ Available Equipment: ${count ?? 0} equipment currently available for rent`,
  ];

  if (data && data.length > 0) {
    lines.push('');
    lines.push('| # | Name | Category | Brand | Price/Day | Location | Rating |');
    lines.push('|---|------|----------|-------|-----------|----------|--------|');

    data.forEach((item, idx) => {
      lines.push(
        `| ${idx + 1} | ${item.name || 'N/A'} | ${item.category || 'N/A'} | ${item.brand || 'N/A'} | ${formatCurrency(item.price_per_day)} | ${truncate(item.location_name, 20)} | ${formatRating(item.rating)} |`
      );
    });

    if ((count ?? 0) > 30) {
      lines.push('');
      lines.push(`... and ${(count ?? 0) - 30} more available items`);
    }
  } else {
    lines.push('');
    lines.push('No equipment currently available for rent.');
  }

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    ['equipment table filtered by is_available=true (real-time)'],
    (data?.length ?? 0) > 0,
    'available_equipment',
    'real-time'
  );
}

async function handleCountLabour(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const [totalRes, availableRes, busyRes] = await Promise.all([
    supabase.from('labour_profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('labour_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('availability', 'available'),
    supabase
      .from('labour_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('availability', 'busy'),
  ]);

  if (totalRes.error) {
    return makeErrorResult('count_labour', `Failed to count labour: ${totalRes.error.message}`);
  }

  const total = totalRes.count ?? 0;
  const available = availableRes.count ?? 0;
  const busy = busyRes.count ?? 0;
  const unavailable = Math.max(0, total - available - busy);

  const stats = await fetchPlatformStats();

  const context = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `👷 Labour Profiles: ${total} total labour profiles on the platform`,
    '',
    `  Available: ${available}`,
    `  Busy: ${busy}`,
    `  Unavailable: ${unavailable}`,
    formatPlatformStats(stats),
  ].join('\n');

  return buildResult(
    context,
    ['labour_profiles table (real-time count)'],
    true,
    'count_labour',
    'real-time'
  );
}

async function handleListLabour(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { data, count, error } = await supabase
    .from('labour_profiles')
    .select(
      `id, skills, experience_years, daily_rate, hourly_rate, location_name, availability, average_rating, review_count, is_active,
      user_profiles!labour_profiles_user_id_fkey (name, profile_image)`,
      { count: 'exact' }
    )
    .eq('is_active', true)
    .order('average_rating', { ascending: false, nullsFirst: false })
    .limit(25);

  if (error) {
    return makeErrorResult('list_labour', `Failed to list labour: ${error.message}`);
  }

  const lines: string[] = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `👷 Labour Profiles: ${count ?? 0} active labour profiles`,
  ];

  if (data && data.length > 0) {
    lines.push('');
    lines.push('| # | Name | Skills | Experience | Daily Rate | Location | Rating | Status |');
    lines.push('|---|------|--------|------------|------------|----------|--------|--------|');

    data.forEach((item, idx) => {
      const userProfile = item.user_profiles as unknown as
        | { name: string | null; profile_image: string | null }
        | { name: string | null; profile_image: string | null }[]
        | null;
      const name = Array.isArray(userProfile) ? userProfile[0]?.name : userProfile?.name;
      const skillsStr = item.skills?.slice(0, 3).join(', ') || 'N/A';

      lines.push(
        `| ${idx + 1} | ${name || 'N/A'} | ${truncate(skillsStr, 25)} | ${item.experience_years ?? 0} yrs | ${formatCurrency(item.daily_rate)} | ${truncate(item.location_name, 18)} | ${formatRating(item.average_rating)} | ${item.availability || 'N/A'} |`
      );
    });

    if ((count ?? 0) > 25) {
      lines.push('');
      lines.push(`... and ${(count ?? 0) - 25} more labour profiles`);
    }
  } else {
    lines.push('');
    lines.push('No active labour profiles found.');
  }

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    ['labour_profiles table with user_profiles join (real-time listing)'],
    (data?.length ?? 0) > 0,
    'list_labour',
    'real-time'
  );
}

async function handleAvailableLabour(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { data, count, error } = await supabase
    .from('labour_profiles')
    .select(
      `id, skills, experience_years, daily_rate, hourly_rate, location_name, average_rating, review_count,
      user_profiles!labour_profiles_user_id_fkey (name, profile_image)`,
      { count: 'exact' }
    )
    .eq('availability', 'available')
    .eq('is_active', true)
    .order('average_rating', { ascending: false, nullsFirst: false })
    .limit(25);

  if (error) {
    return makeErrorResult(
      'available_labour',
      `Failed to query available labour: ${error.message}`
    );
  }

  const lines: string[] = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `✅ Available Labour: ${count ?? 0} workers currently available for hire`,
  ];

  if (data && data.length > 0) {
    lines.push('');
    lines.push('| # | Name | Skills | Experience | Daily Rate | Hourly Rate | Location | Rating |');
    lines.push('|---|------|--------|------------|------------|-------------|----------|--------|');

    data.forEach((item, idx) => {
      const userProfile = item.user_profiles as unknown as
        | { name: string | null; profile_image: string | null }
        | { name: string | null; profile_image: string | null }[]
        | null;
      const name = Array.isArray(userProfile) ? userProfile[0]?.name : userProfile?.name;

      lines.push(
        `| ${idx + 1} | ${name || 'N/A'} | ${truncate(item.skills?.join(', '), 25)} | ${item.experience_years ?? 0} yrs | ${formatCurrency(item.daily_rate)} | ${formatCurrency(item.hourly_rate)} | ${truncate(item.location_name, 18)} | ${formatRating(item.average_rating)} |`
      );
    });

    if ((count ?? 0) > 25) {
      lines.push('');
      lines.push(`... and ${(count ?? 0) - 25} more available workers`);
    }
  } else {
    lines.push('');
    lines.push('No labour currently available for hire.');
  }

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    ['labour_profiles table filtered by availability=available (real-time)'],
    (data?.length ?? 0) > 0,
    'available_labour',
    'real-time'
  );
}

async function handleCountUsers(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const [totalRes, verifiedRes] = await Promise.all([
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_verified', true),
  ]);

  if (totalRes.error) {
    return makeErrorResult('count_users', `Failed to count users: ${totalRes.error.message}`);
  }

  const total = totalRes.count ?? 0;
  const verified = verifiedRes.count ?? 0;

  const stats = await fetchPlatformStats();

  const context = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `👥 User Count: ${total} total users on the platform`,
    `  Verified: ${verified}`,
    `  Unverified: ${total - verified}`,
    formatPlatformStats(stats),
  ].join('\n');

  return buildResult(
    context,
    ['user_profiles table (real-time count)'],
    true,
    'count_users',
    'real-time'
  );
}

async function handleListUsers(userContext?: SmartQueryUserContext): Promise<SmartQueryResult> {
  const supabase = createAdminClient();
  const isAdmin = userContext?.isAdmin === true;

  const { data, count, error } = await supabase
    .from('user_profiles')
    .select('id, name, email, phone, roles, city, state, is_verified', { count: 'exact' })
    .order('name', { ascending: true, nullsFirst: false })
    .limit(30);

  if (error) {
    return makeErrorResult('list_users', `Failed to list users: ${error.message}`);
  }

  const lines: string[] = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `👥 User Directory: ${count ?? 0} total users`,
  ];

  if (data && data.length > 0) {
    lines.push('');
    lines.push('| # | Name | Email | Phone | Roles | City | State | Verified |');
    lines.push('|---|------|-------|-------|-------|------|-------|----------|');

    data.forEach((item, idx) => {
      const rolesStr = item.roles?.join(', ') || 'N/A';
      const displayEmail = isAdmin ? item.email || 'N/A' : maskEmail(item.email);
      const displayPhone = isAdmin ? item.phone || 'N/A' : 'Hidden';
      lines.push(
        `| ${idx + 1} | ${item.name || 'N/A'} | ${displayEmail} | ${displayPhone} | ${rolesStr} | ${item.city || 'N/A'} | ${item.state || 'N/A'} | ${item.is_verified ? '✅' : '❌'} |`
      );
    });

    if ((count ?? 0) > 30) {
      lines.push('');
      lines.push(`... and ${(count ?? 0) - 30} more users`);
    }
  } else {
    lines.push('');
    lines.push('No users found on the platform.');
  }

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    ['user_profiles table (real-time listing)'],
    (data?.length ?? 0) > 0,
    'list_users',
    'real-time'
  );
}

async function handleCountReviews(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true });

  if (error) {
    return makeErrorResult('count_reviews', `Failed to count reviews: ${error.message}`);
  }

  // Get average rating across all reviews
  const { data: ratingData } = await supabase.from('reviews').select('rating');

  let avgRating = 0;
  if (ratingData && ratingData.length > 0) {
    const sum = ratingData.reduce((acc, r) => acc + (r.rating || 0), 0);
    avgRating = sum / ratingData.length;
  }

  const stats = await fetchPlatformStats();

  const context = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `⭐ Review Count: ${count ?? 0} total reviews on the platform`,
    `  Average Rating: ${avgRating.toFixed(1)}/5`,
    formatPlatformStats(stats),
  ].join('\n');

  return buildResult(
    context,
    ['reviews table (real-time count)'],
    true,
    'count_reviews',
    'real-time'
  );
}

async function handleListReviews(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { data, count, error } = await supabase
    .from('reviews')
    .select('id, equipment_id, reviewer_id, rating, comment, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return makeErrorResult('list_reviews', `Failed to list reviews: ${error.message}`);
  }

  const lines: string[] = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `⭐ Recent Reviews: ${count ?? 0} total reviews (showing latest 20)`,
  ];

  if (data && data.length > 0) {
    // Batch fetch equipment names and reviewer names
    const equipmentIds = Array.from(
      new Set(data.map((r) => r.equipment_id).filter(Boolean))
    ) as string[];
    const reviewerIds = Array.from(
      new Set(data.map((r) => r.reviewer_id).filter(Boolean))
    ) as string[];

    const [equipRes, reviewerRes] = await Promise.all([
      equipmentIds.length > 0
        ? supabase.from('equipment').select('id, name').in('id', equipmentIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      reviewerIds.length > 0
        ? supabase.from('user_profiles').select('id, name').in('id', reviewerIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    ]);

    const equipMap = new Map<string, string>(
      (equipRes.data || []).map((e: { id: string; name: string }) => [e.id, e.name])
    );
    const reviewerMap = new Map<string, string>(
      (reviewerRes.data || []).map((u: { id: string; name: string }) => [u.id, u.name])
    );

    lines.push('');
    lines.push('| # | Equipment | Reviewer | Rating | Comment |');
    lines.push('|---|-----------|----------|--------|---------|');

    data.forEach((item, idx) => {
      const equipName = equipMap.get(item.equipment_id) || 'Unknown';
      const reviewerName = reviewerMap.get(item.reviewer_id) || 'Anonymous';

      lines.push(
        `| ${idx + 1} | ${truncate(equipName, 25)} | ${truncate(reviewerName, 20)} | ${'⭐'.repeat(item.rating)} (${item.rating}/5) | ${truncate(item.comment, 50)} |`
      );
    });

    if ((count ?? 0) > 20) {
      lines.push('');
      lines.push(`... and ${(count ?? 0) - 20} more reviews`);
    }
  } else {
    lines.push('');
    lines.push('No reviews found on the platform.');
  }

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    ['reviews table with equipment/user lookups (real-time)'],
    (data?.length ?? 0) > 0,
    'list_reviews',
    'real-time'
  );
}

async function handleReviewsForEquipment(searchTerm: string): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  // First find the equipment by name
  const { data: equipData, error: equipError } = await supabase
    .from('equipment')
    .select('id, name')
    .ilike('name', `%${searchTerm}%`)
    .limit(5);

  if (equipError) {
    return makeErrorResult(
      'reviews_for_equipment',
      `Failed to search equipment: ${equipError.message}`
    );
  }

  if (!equipData || equipData.length === 0) {
    const stats = await fetchPlatformStats();
    return buildResult(
      [
        '=== PLATFORM DATA (Real-time) ===',
        '',
        `🔍 No equipment found matching "${searchTerm}" to fetch reviews for.`,
        formatPlatformStats(stats),
      ].join('\n'),
      [`equipment search for "${searchTerm}"`],
      false,
      'reviews_for_equipment',
      'real-time'
    );
  }

  const equipmentIds = equipData.map((e) => e.id);
  const equipMap = new Map<string, string>(equipData.map((e) => [e.id, e.name]));

  const { data: reviews, error: reviewError } = await supabase
    .from('reviews')
    .select('id, equipment_id, reviewer_id, rating, comment, created_at')
    .in('equipment_id', equipmentIds)
    .order('created_at', { ascending: false })
    .limit(20);

  if (reviewError) {
    return makeErrorResult(
      'reviews_for_equipment',
      `Failed to fetch reviews: ${reviewError.message}`
    );
  }

  const lines: string[] = ['=== PLATFORM DATA (Real-time) ===', ''];

  if (reviews && reviews.length > 0) {
    // Fetch reviewer names
    const reviewerIds = Array.from(
      new Set(reviews.map((r) => r.reviewer_id).filter(Boolean))
    ) as string[];
    const { data: reviewerData } =
      reviewerIds.length > 0
        ? await supabase.from('user_profiles').select('id, name').in('id', reviewerIds)
        : { data: [] as { id: string; name: string }[] };

    const reviewerMap = new Map<string, string>(
      (reviewerData || []).map((u: { id: string; name: string }) => [u.id, u.name])
    );

    lines.push(`⭐ Reviews for "${searchTerm}": ${reviews.length} review(s) found`, '');

    const matchedNames = Array.from(
      new Set(reviews.map((r) => equipMap.get(r.equipment_id)).filter(Boolean))
    ) as string[];
    if (matchedNames.length > 0) {
      lines.push(`Matched Equipment: ${matchedNames.join(', ')}`, '');
    }

    lines.push('| # | Equipment | Reviewer | Rating | Comment |');
    lines.push('|---|-----------|----------|--------|---------|');

    reviews.forEach((item, idx) => {
      const equipName = equipMap.get(item.equipment_id) || 'Unknown';
      const reviewerName = reviewerMap.get(item.reviewer_id) || 'Anonymous';

      lines.push(
        `| ${idx + 1} | ${truncate(equipName, 25)} | ${truncate(reviewerName, 20)} | ${'⭐'.repeat(item.rating)} (${item.rating}/5) | ${truncate(item.comment, 50)} |`
      );
    });
  } else {
    lines.push(`⭐ No reviews found for equipment matching "${searchTerm}".`);
    const matchedNames = equipData.map((e) => e.name).join(', ');
    lines.push(`  Matched equipment: ${matchedNames} (but no reviews yet)`);
  }

  const stats = await fetchPlatformStats();
  lines.push('');
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    [`reviews for equipment matching "${searchTerm}" (real-time)`],
    (reviews?.length ?? 0) > 0,
    'reviews_for_equipment',
    'real-time'
  );
}

async function handleCountBookings(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const [totalRes, pendingRes, confirmedRes, inProgressRes, completedRes, cancelledRes] =
    await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'confirmed'),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'in_progress'),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed'),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'cancelled'),
    ]);

  if (totalRes.error) {
    return makeErrorResult('count_bookings', `Failed to count bookings: ${totalRes.error.message}`);
  }

  const stats = await fetchPlatformStats();

  const context = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `📋 Booking Count: ${totalRes.count ?? 0} total bookings on the platform`,
    '',
    '  Status Breakdown:',
    `  Pending: ${pendingRes.count ?? 0}`,
    `  Confirmed: ${confirmedRes.count ?? 0}`,
    `  In Progress: ${inProgressRes.count ?? 0}`,
    `  Completed: ${completedRes.count ?? 0}`,
    `  Cancelled: ${cancelledRes.count ?? 0}`,
    formatPlatformStats(stats),
  ].join('\n');

  return buildResult(
    context,
    ['bookings table (real-time count with status breakdown)'],
    true,
    'count_bookings',
    'real-time'
  );
}

async function handleListBookings(userContext?: SmartQueryUserContext): Promise<SmartQueryResult> {
  const supabase = createAdminClient();
  const isAdmin = userContext?.isAdmin === true;
  const userId = userContext?.userId;

  // If not admin and no userId, show count-only summary
  if (!isAdmin && !userId) {
    const { count, error } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return makeErrorResult('list_bookings', `Failed to list bookings: ${error.message}`);
    }

    const stats = await fetchPlatformStats();

    const context = [
      '=== PLATFORM DATA (Real-time) ===',
      '',
      `📋 Bookings Summary: ${count ?? 0} total bookings on the platform`,
      '',
      'Sign in to view your personal booking details.',
      formatPlatformStats(stats),
    ].join('\n');

    return buildResult(
      context,
      ['bookings table (count-only summary for unauthenticated user)'],
      (count ?? 0) > 0,
      'list_bookings',
      'real-time'
    );
  }

  // If not admin but has userId, only show their bookings
  if (!isAdmin && userId) {
    // Fetch equipment owned by this user to also show bookings on their equipment
    const { data: ownedEquip } = await supabase
      .from('equipment')
      .select('id')
      .eq('owner_id', userId);

    const ownedEquipIds = (ownedEquip || []).map((e) => e.id);

    let query = supabase
      .from('bookings')
      .select(
        'id, equipment_id, renter_id, start_date, end_date, total_days, price_per_day, total_amount, status, notes',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .limit(20);

    if (ownedEquipIds.length > 0) {
      query = query.or(`renter_id.eq.${userId},equipment_id.in.(${ownedEquipIds.join(',')})`);
    } else {
      query = query.eq('renter_id', userId);
    }

    const { data, count, error } = await query;

    if (error) {
      return makeErrorResult('list_bookings', `Failed to list bookings: ${error.message}`);
    }

    const lines: string[] = [
      '=== PLATFORM DATA (Real-time) ===',
      '',
      `📋 Your Bookings: ${count ?? 0} bookings found (showing latest 20)`,
    ];

    if (data && data.length > 0) {
      const equipmentIds = Array.from(
        new Set(data.map((b) => b.equipment_id).filter(Boolean))
      ) as string[];
      const renterIds = Array.from(
        new Set(data.map((b) => b.renter_id).filter(Boolean))
      ) as string[];

      const [equipRes, renterRes] = await Promise.all([
        equipmentIds.length > 0
          ? supabase.from('equipment').select('id, name').in('id', equipmentIds)
          : Promise.resolve({ data: [] as { id: string; name: string }[] }),
        renterIds.length > 0
          ? supabase.from('user_profiles').select('id, name').in('id', renterIds)
          : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      ]);

      const equipMap = new Map<string, string>(
        (equipRes.data || []).map((e: { id: string; name: string }) => [e.id, e.name])
      );
      const renterMap = new Map<string, string>(
        (renterRes.data || []).map((u: { id: string; name: string }) => [u.id, u.name])
      );

      lines.push('');
      lines.push('| # | Equipment | Renter | Start | End | Days | Amount | Status |');
      lines.push('|---|-----------|--------|-------|-----|------|--------|--------|');

      data.forEach((item, idx) => {
        const equipName = equipMap.get(item.equipment_id) || 'Unknown';
        const renterName = renterMap.get(item.renter_id) || 'Unknown';

        lines.push(
          `| ${idx + 1} | ${truncate(equipName, 20)} | ${truncate(renterName, 15)} | ${item.start_date || 'N/A'} | ${item.end_date || 'N/A'} | ${item.total_days ?? 'N/A'} | ${formatCurrency(item.total_amount)} | ${item.status || 'N/A'} |`
        );
      });

      if ((count ?? 0) > 20) {
        lines.push('');
        lines.push(`... and ${(count ?? 0) - 20} more bookings`);
      }
    } else {
      lines.push('');
      lines.push('No bookings found.');
    }

    const stats = await fetchPlatformStats();
    lines.push(formatPlatformStats(stats));

    return buildResult(
      lines.join('\n'),
      ['bookings table filtered by user (real-time)'],
      (data?.length ?? 0) > 0,
      'list_bookings',
      'real-time'
    );
  }

  // Admin: full listing (original behavior)
  const { data, count, error } = await supabase
    .from('bookings')
    .select(
      'id, equipment_id, renter_id, start_date, end_date, total_days, price_per_day, total_amount, status, notes',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return makeErrorResult('list_bookings', `Failed to list bookings: ${error.message}`);
  }

  const lines: string[] = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `📋 Recent Bookings: ${count ?? 0} total bookings (showing latest 20)`,
  ];

  if (data && data.length > 0) {
    // Batch fetch equipment names and renter names
    const equipmentIds = Array.from(
      new Set(data.map((b) => b.equipment_id).filter(Boolean))
    ) as string[];
    const renterIds = Array.from(new Set(data.map((b) => b.renter_id).filter(Boolean))) as string[];

    const [equipRes, renterRes] = await Promise.all([
      equipmentIds.length > 0
        ? supabase.from('equipment').select('id, name').in('id', equipmentIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      renterIds.length > 0
        ? supabase.from('user_profiles').select('id, name').in('id', renterIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    ]);

    const equipMap = new Map<string, string>(
      (equipRes.data || []).map((e: { id: string; name: string }) => [e.id, e.name])
    );
    const renterMap = new Map<string, string>(
      (renterRes.data || []).map((u: { id: string; name: string }) => [u.id, u.name])
    );

    lines.push('');
    lines.push('| # | Equipment | Renter | Start | End | Days | Amount | Status |');
    lines.push('|---|-----------|--------|-------|-----|------|--------|--------|');

    data.forEach((item, idx) => {
      const equipName = equipMap.get(item.equipment_id) || 'Unknown';
      const renterName = renterMap.get(item.renter_id) || 'Unknown';

      lines.push(
        `| ${idx + 1} | ${truncate(equipName, 20)} | ${truncate(renterName, 15)} | ${item.start_date || 'N/A'} | ${item.end_date || 'N/A'} | ${item.total_days ?? 'N/A'} | ${formatCurrency(item.total_amount)} | ${item.status || 'N/A'} |`
      );
    });

    if ((count ?? 0) > 20) {
      lines.push('');
      lines.push(`... and ${(count ?? 0) - 20} more bookings`);
    }
  } else {
    lines.push('');
    lines.push('No bookings found on the platform.');
  }

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    ['bookings table with equipment/user lookups (real-time)'],
    (data?.length ?? 0) > 0,
    'list_bookings',
    'real-time'
  );
}

async function handleBookingStatus(status: string): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { data, count, error } = await supabase
    .from('bookings')
    .select('id, equipment_id, renter_id, start_date, end_date, total_days, total_amount, status', {
      count: 'exact',
    })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return makeErrorResult(
      'booking_status',
      `Failed to query ${status} bookings: ${error.message}`
    );
  }

  const lines: string[] = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    `📋 ${capitalize(status.replace('_', ' '))} Bookings: ${count ?? 0} found`,
  ];

  if (data && data.length > 0) {
    const equipmentIds = Array.from(
      new Set(data.map((b) => b.equipment_id).filter(Boolean))
    ) as string[];
    const renterIds = Array.from(new Set(data.map((b) => b.renter_id).filter(Boolean))) as string[];

    const [equipRes, renterRes] = await Promise.all([
      equipmentIds.length > 0
        ? supabase.from('equipment').select('id, name').in('id', equipmentIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      renterIds.length > 0
        ? supabase.from('user_profiles').select('id, name').in('id', renterIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    ]);

    const equipMap = new Map<string, string>(
      (equipRes.data || []).map((e: { id: string; name: string }) => [e.id, e.name])
    );
    const renterMap = new Map<string, string>(
      (renterRes.data || []).map((u: { id: string; name: string }) => [u.id, u.name])
    );

    lines.push('');
    lines.push('| # | Equipment | Renter | Start | End | Days | Amount |');
    lines.push('|---|-----------|--------|-------|-----|------|--------|');

    data.forEach((item, idx) => {
      const equipName = equipMap.get(item.equipment_id) || 'Unknown';
      const renterName = renterMap.get(item.renter_id) || 'Unknown';

      lines.push(
        `| ${idx + 1} | ${truncate(equipName, 20)} | ${truncate(renterName, 15)} | ${item.start_date || 'N/A'} | ${item.end_date || 'N/A'} | ${item.total_days ?? 'N/A'} | ${formatCurrency(item.total_amount)} |`
      );
    });

    if ((count ?? 0) > 20) {
      lines.push('');
      lines.push(`... and ${(count ?? 0) - 20} more ${status.replace('_', ' ')} bookings`);
    }
  } else {
    lines.push('');
    lines.push(`No ${status.replace('_', ' ')} bookings found.`);
  }

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    [`bookings table filtered by status='${status}' (real-time)`],
    (data?.length ?? 0) > 0,
    'booking_status',
    'real-time'
  );
}

async function handlePlatformStats(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();
  const stats = await fetchPlatformStats();

  // Get additional breakdown data
  const [availableEquip, availableLabour, verifiedUsers] = await Promise.all([
    supabase
      .from('equipment')
      .select('id', { count: 'exact', head: true })
      .eq('is_available', true),
    supabase
      .from('labour_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('availability', 'available'),
    supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_verified', true),
  ]);

  // Get category breakdown
  const { data: categoryData } = await supabase.from('equipment').select('category');

  const categoryCounts: Record<string, number> = {};
  if (categoryData) {
    categoryData.forEach((item) => {
      const cat = item.category || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  }

  const lines: string[] = [
    '=== PLATFORM DATA (Real-time) ===',
    '',
    '📊 Platform Overview',
    '',
    '--- Equipment ---',
    `  Total: ${stats.totalEquipment}`,
    `  Available: ${availableEquip.count ?? 0}`,
    `  Unavailable: ${stats.totalEquipment - (availableEquip.count ?? 0)}`,
    '',
    '  By Category:',
  ];

  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, cnt]) => {
      lines.push(`    ${capitalize(cat)}: ${cnt}`);
    });

  lines.push(
    '',
    '--- Users ---',
    `  Total: ${stats.totalUsers}`,
    `  Verified: ${verifiedUsers.count ?? 0}`,
    '',
    '--- Labour ---',
    `  Total Profiles: ${stats.totalLabour}`,
    `  Currently Available: ${availableLabour.count ?? 0}`,
    '',
    '--- Reviews ---',
    `  Total: ${stats.totalReviews}`,
    '',
    '--- Bookings ---',
    `  Total: ${stats.totalBookings}`,
    '',
    `Last Updated: ${formatTimestamp()}`
  );

  return buildResult(
    lines.join('\n'),
    [
      'equipment table',
      'user_profiles table',
      'labour_profiles table',
      'reviews table',
      'bookings table',
    ],
    true,
    'platform_stats',
    'real-time'
  );
}

async function handleVectorSearch(userMessage: string): Promise<SmartQueryResult> {
  try {
    const embeddingResult = await generateEmbedding(userMessage);

    if (!embeddingResult.success || embeddingResult.embedding.length === 0) {
      const stats = await fetchPlatformStats();
      return buildResult(
        [
          '=== PLATFORM DATA (Cached Knowledge Base) ===',
          '',
          'Unable to generate search embedding. Providing platform summary instead.',
          formatPlatformStats(stats),
        ].join('\n'),
        ['platform summary (fallback)'],
        false,
        'vector_search',
        'cached'
      );
    }

    const results = await searchKnowledge(embeddingResult.embedding, {
      threshold: 0.3,
      limit: 10,
    });

    if (!results || results.length === 0) {
      const stats = await fetchPlatformStats();
      return buildResult(
        [
          '=== PLATFORM DATA (Cached Knowledge Base) ===',
          '',
          'No matching data found in the knowledge base for this query.',
          formatPlatformStats(stats),
        ].join('\n'),
        ['knowledge base search (no results)'],
        false,
        'vector_search',
        'cached'
      );
    }

    const lines: string[] = [
      '=== PLATFORM DATA (Cached Knowledge Base) ===',
      '',
      `🔍 Found ${results.length} relevant result(s):`,
      '',
    ];

    results.forEach((result, idx) => {
      const similarity = (result.similarity * 100).toFixed(1);
      lines.push(`--- Result ${idx + 1} (${similarity}% match, type: ${result.source_type}) ---`);
      lines.push(result.content);
      lines.push('');
    });

    const stats = await fetchPlatformStats();
    lines.push(formatPlatformStats(stats));

    return buildResult(
      lines.join('\n'),
      results.map(
        (r) => `${r.source_type}:${r.source_id} (${(r.similarity * 100).toFixed(1)}% match)`
      ),
      true,
      'vector_search',
      'cached'
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const stats = await fetchPlatformStats();
    return buildResult(
      [
        '=== PLATFORM DATA ===',
        '',
        `Vector search encountered an error: ${errorMsg}`,
        'Providing platform summary instead.',
        formatPlatformStats(stats),
      ].join('\n'),
      ['platform summary (error fallback)'],
      false,
      'vector_search',
      'cached'
    );
  }
}

// ─── User-Specific Handlers ──────────────────────────────────────────────────

async function handleMyBookings(userId: string): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  // Also fetch equipment owned by this user to show bookings on their equipment
  const { data: ownedEquip } = await supabase.from('equipment').select('id').eq('owner_id', userId);

  const ownedEquipIds = (ownedEquip || []).map((e) => e.id);

  let query = supabase
    .from('bookings')
    .select(
      'id, equipment_id, renter_id, start_date, end_date, total_days, price_per_day, total_amount, status, created_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .limit(20);

  if (ownedEquipIds.length > 0) {
    query = query.or(`renter_id.eq.${userId},equipment_id.in.(${ownedEquipIds.join(',')})`);
  } else {
    query = query.eq('renter_id', userId);
  }

  const { data, count, error } = await query;

  if (error) {
    return makeErrorResult('my_bookings', `Failed to fetch your bookings: ${error.message}`);
  }

  const lines: string[] = [
    '=== YOUR BOOKINGS (Real-time) ===',
    '',
    `📋 Your Bookings: ${count ?? 0} total`,
  ];

  if (data && data.length > 0) {
    // Batch fetch equipment names
    const equipmentIds = Array.from(
      new Set(data.map((b) => b.equipment_id).filter(Boolean))
    ) as string[];

    const equipRes =
      equipmentIds.length > 0
        ? await supabase.from('equipment').select('id, name').in('id', equipmentIds)
        : { data: [] as { id: string; name: string }[] };

    const equipMap = new Map<string, string>(
      (equipRes.data || []).map((e: { id: string; name: string }) => [e.id, e.name])
    );

    lines.push('');
    lines.push('| # | Equipment | Dates | Days | Amount | Status |');
    lines.push('|---|-----------|-------|------|--------|--------|');

    data.forEach((item, idx) => {
      const equipName = equipMap.get(item.equipment_id) || 'Unknown';
      const dates = `${item.start_date || 'N/A'} → ${item.end_date || 'N/A'}`;

      lines.push(
        `| ${idx + 1} | ${truncate(equipName, 25)} | ${dates} | ${item.total_days ?? 'N/A'} | ${formatCurrency(item.total_amount)} | ${item.status || 'N/A'} |`
      );
    });

    if ((count ?? 0) > 20) {
      lines.push('');
      lines.push(`... and ${(count ?? 0) - 20} more bookings`);
    }
  } else {
    lines.push('');
    lines.push('You have no bookings yet.');
  }

  return buildResult(
    lines.join('\n'),
    ['bookings table filtered by user (real-time)'],
    (data?.length ?? 0) > 0,
    'my_bookings',
    'real-time'
  );
}

async function handleMyBookingStatus(userId: string, status: string): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  // Also fetch equipment owned by this user
  const { data: ownedEquip } = await supabase.from('equipment').select('id').eq('owner_id', userId);

  const ownedEquipIds = (ownedEquip || []).map((e) => e.id);

  let query = supabase
    .from('bookings')
    .select(
      'id, equipment_id, renter_id, start_date, end_date, total_days, price_per_day, total_amount, status, created_at',
      { count: 'exact' }
    )
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(20);

  if (ownedEquipIds.length > 0) {
    query = query.or(`renter_id.eq.${userId},equipment_id.in.(${ownedEquipIds.join(',')})`);
  } else {
    query = query.eq('renter_id', userId);
  }

  const { data, count, error } = await query;

  if (error) {
    return makeErrorResult(
      'my_booking_status',
      `Failed to fetch your ${status} bookings: ${error.message}`
    );
  }

  const lines: string[] = [
    '=== YOUR BOOKINGS (Real-time) ===',
    '',
    `📋 Your ${capitalize(status.replace('_', ' '))} Bookings: ${count ?? 0} found`,
  ];

  if (data && data.length > 0) {
    const equipmentIds = Array.from(
      new Set(data.map((b) => b.equipment_id).filter(Boolean))
    ) as string[];

    const equipRes =
      equipmentIds.length > 0
        ? await supabase.from('equipment').select('id, name').in('id', equipmentIds)
        : { data: [] as { id: string; name: string }[] };

    const equipMap = new Map<string, string>(
      (equipRes.data || []).map((e: { id: string; name: string }) => [e.id, e.name])
    );

    lines.push('');
    lines.push('| # | Equipment | Dates | Days | Amount | Status |');
    lines.push('|---|-----------|-------|------|--------|--------|');

    data.forEach((item, idx) => {
      const equipName = equipMap.get(item.equipment_id) || 'Unknown';
      const dates = `${item.start_date || 'N/A'} → ${item.end_date || 'N/A'}`;

      lines.push(
        `| ${idx + 1} | ${truncate(equipName, 25)} | ${dates} | ${item.total_days ?? 'N/A'} | ${formatCurrency(item.total_amount)} | ${item.status || 'N/A'} |`
      );
    });

    if ((count ?? 0) > 20) {
      lines.push('');
      lines.push(`... and ${(count ?? 0) - 20} more ${status.replace('_', ' ')} bookings`);
    }
  } else {
    lines.push('');
    lines.push(`You have no ${status.replace('_', ' ')} bookings.`);
  }

  return buildResult(
    lines.join('\n'),
    [`bookings table filtered by user and status='${status}' (real-time)`],
    (data?.length ?? 0) > 0,
    'my_booking_status',
    'real-time'
  );
}

async function handleMyEquipment(userId: string): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { data, count, error } = await supabase
    .from('equipment')
    .select(
      'id, name, category, brand, price_per_day, rating, is_available, review_count, created_at',
      { count: 'exact' }
    )
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return makeErrorResult('my_equipment', `Failed to fetch your equipment: ${error.message}`);
  }

  const lines: string[] = [
    '=== YOUR EQUIPMENT (Real-time) ===',
    '',
    `🚜 Your Equipment: ${count ?? 0} listed`,
  ];

  if (data && data.length > 0) {
    lines.push('');
    lines.push('| # | Name | Category | Brand | Price/Day | Rating | Reviews | Available |');
    lines.push('|---|------|----------|-------|-----------|--------|---------|-----------|');

    data.forEach((item, idx) => {
      lines.push(
        `| ${idx + 1} | ${item.name || 'N/A'} | ${item.category || 'N/A'} | ${item.brand || 'N/A'} | ${formatCurrency(item.price_per_day)} | ${formatRating(item.rating)} | ${item.review_count ?? 0} | ${formatAvailability(item.is_available)} |`
      );
    });
  } else {
    lines.push('');
    lines.push('You have no equipment listed on the platform.');
  }

  return buildResult(
    lines.join('\n'),
    ['equipment table filtered by owner_id (real-time)'],
    (data?.length ?? 0) > 0,
    'my_equipment',
    'real-time'
  );
}

async function handleMyProfile(userId: string): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const [profileRes, rolesRes, labourRes] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', userId).single(),
    supabase.from('user_roles').select('role').eq('user_id', userId),
    supabase.from('labour_profiles').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  if (profileRes.error) {
    return makeErrorResult(
      'my_profile',
      `Failed to fetch your profile: ${profileRes.error.message}`
    );
  }

  const profile = profileRes.data;
  const roles = (rolesRes.data || []).map((r) => r.role);

  const lines: string[] = [
    '=== YOUR PROFILE (Real-time) ===',
    '',
    '👤 Profile Details',
    '',
    `  Name: ${profile.name || 'N/A'}`,
    `  Email: ${profile.email || 'N/A'}`,
    `  Phone: ${profile.phone || 'N/A'}`,
    `  City: ${profile.city || 'N/A'}`,
    `  State: ${profile.state || 'N/A'}`,
    `  Verified: ${profile.is_verified ? '✅ Yes' : '❌ No'}`,
    `  Roles (from profile): ${profile.roles?.join(', ') || 'N/A'}`,
    `  Roles (from user_roles): ${roles.length > 0 ? roles.join(', ') : 'N/A'}`,
  ];

  if (profile.bio) {
    lines.push(`  Bio: ${truncate(profile.bio, 150)}`);
  }

  // Show labour profile if it exists
  const labour = labourRes.data;
  if (labour) {
    lines.push('');
    lines.push('--- Labour Profile ---');
    lines.push(`  Skills: ${labour.skills?.join(', ') || 'N/A'}`);
    lines.push(`  Experience: ${labour.experience_years ?? 0} years`);
    lines.push(`  Daily Rate: ${formatCurrency(labour.daily_rate)}`);
    lines.push(`  Hourly Rate: ${formatCurrency(labour.hourly_rate)}`);
    lines.push(`  Location: ${labour.location_name || 'N/A'}`);
    lines.push(`  Availability: ${labour.availability || 'N/A'}`);
    lines.push(
      `  Rating: ${formatRating(labour.average_rating)} (${labour.review_count ?? 0} reviews)`
    );
    lines.push(`  Active: ${labour.is_active ? '✅ Yes' : '❌ No'}`);
  }

  return buildResult(
    lines.join('\n'),
    ['user_profiles table', 'user_roles table', 'labour_profiles table'],
    true,
    'my_profile',
    'real-time'
  );
}

async function handleMyReviews(userId: string): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  // Reviews the user wrote
  const { data: writtenReviews, error: writtenError } = await supabase
    .from('reviews')
    .select('id, equipment_id, rating, comment, created_at')
    .eq('reviewer_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (writtenError) {
    return makeErrorResult('my_reviews', `Failed to fetch your reviews: ${writtenError.message}`);
  }

  // Reviews on equipment owned by this user
  const { data: ownedEquip } = await supabase.from('equipment').select('id').eq('owner_id', userId);

  const ownedEquipIds = (ownedEquip || []).map((e) => e.id);

  let receivedReviews: {
    id: string;
    equipment_id: string;
    reviewer_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
  }[] = [];
  if (ownedEquipIds.length > 0) {
    const { data: received } = await supabase
      .from('reviews')
      .select('id, equipment_id, reviewer_id, rating, comment, created_at')
      .in('equipment_id', ownedEquipIds)
      .order('created_at', { ascending: false })
      .limit(20);
    receivedReviews = received || [];
  }

  // Batch fetch equipment names for all reviews
  const allEquipIds = Array.from(
    new Set(
      [
        ...(writtenReviews || []).map((r) => r.equipment_id),
        ...receivedReviews.map((r) => r.equipment_id),
      ].filter(Boolean)
    )
  ) as string[];

  const equipRes =
    allEquipIds.length > 0
      ? await supabase.from('equipment').select('id, name').in('id', allEquipIds)
      : { data: [] as { id: string; name: string }[] };

  const equipMap = new Map<string, string>(
    (equipRes.data || []).map((e: { id: string; name: string }) => [e.id, e.name])
  );

  // Fetch reviewer names for received reviews
  const receivedReviewerIds = Array.from(
    new Set(receivedReviews.map((r) => r.reviewer_id).filter(Boolean))
  ) as string[];

  const reviewerRes =
    receivedReviewerIds.length > 0
      ? await supabase.from('user_profiles').select('id, name').in('id', receivedReviewerIds)
      : { data: [] as { id: string; name: string }[] };

  const reviewerMap = new Map<string, string>(
    (reviewerRes.data || []).map((u: { id: string; name: string }) => [u.id, u.name])
  );

  const lines: string[] = ['=== YOUR REVIEWS (Real-time) ===', ''];

  // Section 1: Reviews written by user
  lines.push(`✍️ Reviews You Wrote: ${writtenReviews?.length ?? 0}`);

  if (writtenReviews && writtenReviews.length > 0) {
    lines.push('');
    lines.push('| # | Equipment | Rating | Comment |');
    lines.push('|---|-----------|--------|---------|');

    writtenReviews.forEach((item, idx) => {
      const equipName = equipMap.get(item.equipment_id) || 'Unknown';
      lines.push(
        `| ${idx + 1} | ${truncate(equipName, 25)} | ${'⭐'.repeat(item.rating)} (${item.rating}/5) | ${truncate(item.comment, 50)} |`
      );
    });
  } else {
    lines.push('');
    lines.push('You have not written any reviews yet.');
  }

  // Section 2: Reviews received on user's equipment
  lines.push('');
  lines.push(`📥 Reviews on Your Equipment: ${receivedReviews.length}`);

  if (receivedReviews.length > 0) {
    lines.push('');
    lines.push('| # | Equipment | Reviewer | Rating | Comment |');
    lines.push('|---|-----------|----------|--------|---------|');

    receivedReviews.forEach((item, idx) => {
      const equipName = equipMap.get(item.equipment_id) || 'Unknown';
      const reviewerName = reviewerMap.get(item.reviewer_id) || 'Anonymous';
      lines.push(
        `| ${idx + 1} | ${truncate(equipName, 25)} | ${truncate(reviewerName, 20)} | ${'⭐'.repeat(item.rating)} (${item.rating}/5) | ${truncate(item.comment, 50)} |`
      );
    });
  } else {
    lines.push('');
    lines.push('No reviews received on your equipment yet.');
  }

  return buildResult(
    lines.join('\n'),
    ['reviews table filtered by user (real-time)'],
    (writtenReviews?.length ?? 0) > 0 || receivedReviews.length > 0,
    'my_reviews',
    'real-time'
  );
}

// ─── Admin Analytics Handlers ────────────────────────────────────────────────

async function handleAnalyticsMostRented(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.from('bookings').select('equipment_id');

  if (error) {
    return makeErrorResult(
      'analytics_most_rented',
      `Failed to fetch booking data: ${error.message}`
    );
  }

  if (!data || data.length === 0) {
    return buildResult(
      [
        '=== ANALYTICS (Real-time) ===',
        '',
        '📊 Most Rented Equipment: No bookings found on the platform.',
      ].join('\n'),
      ['bookings table (analytics)'],
      false,
      'analytics_most_rented',
      'real-time'
    );
  }

  // Aggregate booking counts by equipment_id in JS
  const countMap: Record<string, number> = {};
  data.forEach((b) => {
    if (b.equipment_id) {
      countMap[b.equipment_id] = (countMap[b.equipment_id] || 0) + 1;
    }
  });

  const sorted = Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const equipIds = sorted.map(([id]) => id);

  const equipRes =
    equipIds.length > 0
      ? await supabase.from('equipment').select('id, name, category').in('id', equipIds)
      : { data: [] as { id: string; name: string; category: string }[] };

  const equipMap = new Map<string, { name: string; category: string }>(
    (equipRes.data || []).map((e: { id: string; name: string; category: string }) => [
      e.id,
      { name: e.name, category: e.category },
    ])
  );

  const lines: string[] = [
    '=== ANALYTICS (Real-time) ===',
    '',
    '📊 Top 10 Most Rented Equipment',
    '',
    '| Rank | Equipment | Category | Booking Count |',
    '|------|-----------|----------|---------------|',
  ];

  sorted.forEach(([equipId, cnt], idx) => {
    const equip = equipMap.get(equipId);
    lines.push(
      `| ${idx + 1} | ${equip?.name || 'Unknown'} | ${equip?.category || 'N/A'} | ${cnt} |`
    );
  });

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    ['bookings table aggregated by equipment_id (analytics)'],
    true,
    'analytics_most_rented',
    'real-time'
  );
}

async function handleAnalyticsRevenue(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('bookings')
    .select('total_amount, start_date, status')
    .in('status', ['completed', 'confirmed', 'in_progress']);

  if (error) {
    return makeErrorResult('analytics_revenue', `Failed to fetch revenue data: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return buildResult(
      [
        '=== ANALYTICS (Real-time) ===',
        '',
        '💰 Revenue: No completed/confirmed/in-progress bookings found.',
      ].join('\n'),
      ['bookings table (revenue analytics)'],
      false,
      'analytics_revenue',
      'real-time'
    );
  }

  const totalRevenue = data.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  // Monthly breakdown
  const monthlyMap: Record<string, number> = {};
  data.forEach((b) => {
    if (b.start_date) {
      const month = b.start_date.slice(0, 7); // YYYY-MM
      monthlyMap[month] = (monthlyMap[month] || 0) + (b.total_amount || 0);
    }
  });

  const sortedMonths = Object.entries(monthlyMap).sort((a, b) => b[0].localeCompare(a[0]));

  const lines: string[] = [
    '=== ANALYTICS (Real-time) ===',
    '',
    '💰 Revenue Summary',
    '',
    `  Total Revenue: ${formatCurrency(totalRevenue)}`,
    `  Total Bookings (completed/confirmed/in-progress): ${data.length}`,
    `  Average Booking Value: ${formatCurrency(Math.round(totalRevenue / data.length))}`,
  ];

  if (sortedMonths.length > 0) {
    lines.push('');
    lines.push('--- Monthly Breakdown ---');
    lines.push('');
    lines.push('| Month | Revenue | Bookings |');
    lines.push('|-------|---------|----------|');

    sortedMonths.slice(0, 12).forEach(([month, revenue]) => {
      const bookingsInMonth = data.filter((b) => b.start_date?.startsWith(month)).length;
      lines.push(`| ${month} | ${formatCurrency(revenue)} | ${bookingsInMonth} |`);
    });
  }

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    ['bookings table (revenue analytics)'],
    true,
    'analytics_revenue',
    'real-time'
  );
}

async function handleAnalyticsIdleEquipment(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();

  // Get all equipment
  const { data: allEquipment, error: equipError } = await supabase
    .from('equipment')
    .select('id, name, category, location_name');

  if (equipError) {
    return makeErrorResult(
      'analytics_idle_equipment',
      `Failed to fetch equipment data: ${equipError.message}`
    );
  }

  if (!allEquipment || allEquipment.length === 0) {
    return buildResult(
      [
        '=== ANALYTICS (Real-time) ===',
        '',
        '💤 Idle Equipment: No equipment found on the platform.',
      ].join('\n'),
      ['equipment table (idle analytics)'],
      false,
      'analytics_idle_equipment',
      'real-time'
    );
  }

  // Get bookings from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('equipment_id, start_date')
    .gte('start_date', cutoffDate);

  const recentlyBookedIds = new Set(
    (recentBookings || []).map((b) => b.equipment_id).filter(Boolean)
  );

  // Get last booking date for all equipment
  const { data: allBookings } = await supabase
    .from('bookings')
    .select('equipment_id, start_date')
    .order('start_date', { ascending: false });

  const lastBookingMap = new Map<string, string>();
  (allBookings || []).forEach((b) => {
    if (b.equipment_id && !lastBookingMap.has(b.equipment_id)) {
      lastBookingMap.set(b.equipment_id, b.start_date);
    }
  });

  // Find idle equipment (not booked in last 30 days)
  const idleEquipment = allEquipment.filter((e) => !recentlyBookedIds.has(e.id));

  const lines: string[] = [
    '=== ANALYTICS (Real-time) ===',
    '',
    `💤 Idle Equipment: ${idleEquipment.length} of ${allEquipment.length} equipment not booked in the last 30 days`,
  ];

  if (idleEquipment.length > 0) {
    lines.push('');
    lines.push('| # | Name | Category | Location | Last Booking |');
    lines.push('|---|------|----------|----------|--------------|');

    idleEquipment.slice(0, 30).forEach((item, idx) => {
      const lastBooking = lastBookingMap.get(item.id) || 'Never';
      lines.push(
        `| ${idx + 1} | ${item.name || 'N/A'} | ${item.category || 'N/A'} | ${truncate(item.location_name, 20)} | ${lastBooking} |`
      );
    });

    if (idleEquipment.length > 30) {
      lines.push('');
      lines.push(`... and ${idleEquipment.length - 30} more idle equipment`);
    }
  } else {
    lines.push('');
    lines.push('All equipment has been booked within the last 30 days.');
  }

  const stats = await fetchPlatformStats();
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    ['equipment table', 'bookings table (idle equipment analytics)'],
    idleEquipment.length > 0,
    'analytics_idle_equipment',
    'real-time'
  );
}

async function handleAnalyticsOverview(): Promise<SmartQueryResult> {
  const supabase = createAdminClient();
  const stats = await fetchPlatformStats();

  // Most rented (top 5)
  const { data: bookingsData } = await supabase
    .from('bookings')
    .select('equipment_id, total_amount, status, start_date');

  const countMap: Record<string, number> = {};
  let totalRevenue = 0;
  let activeBookings = 0;
  const monthlyRevenue: Record<string, number> = {};

  (bookingsData || []).forEach((b) => {
    if (b.equipment_id) {
      countMap[b.equipment_id] = (countMap[b.equipment_id] || 0) + 1;
    }
    if (['completed', 'confirmed', 'in_progress'].includes(b.status)) {
      totalRevenue += b.total_amount || 0;
      if (b.start_date) {
        const month = b.start_date.slice(0, 7);
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (b.total_amount || 0);
      }
    }
    if (['confirmed', 'in_progress'].includes(b.status)) {
      activeBookings++;
    }
  });

  const topEquipIds = Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topIds = topEquipIds.map(([id]) => id);
  const equipRes =
    topIds.length > 0
      ? await supabase.from('equipment').select('id, name').in('id', topIds)
      : { data: [] as { id: string; name: string }[] };

  const equipMap = new Map<string, string>(
    (equipRes.data || []).map((e: { id: string; name: string }) => [e.id, e.name])
  );

  // Idle equipment count
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('equipment_id')
    .gte('start_date', cutoffDate);

  const recentlyBookedIds = new Set(
    (recentBookings || []).map((b) => b.equipment_id).filter(Boolean)
  );

  const { count: totalEquipCount } = await supabase
    .from('equipment')
    .select('id', { count: 'exact', head: true });

  // Count equipment not recently booked
  const { data: allEquipIds } = await supabase.from('equipment').select('id');
  const idleCount = (allEquipIds || []).filter((e) => !recentlyBookedIds.has(e.id)).length;

  const sortedMonths = Object.entries(monthlyRevenue)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6);

  const lines: string[] = [
    '=== ANALYTICS OVERVIEW (Real-time) ===',
    '',
    '📊 Business Dashboard',
    '',
    '--- Revenue ---',
    `  Total Revenue: ${formatCurrency(totalRevenue)}`,
    `  Total Bookings: ${stats.totalBookings}`,
    `  Active Bookings: ${activeBookings}`,
    `  Avg Booking Value: ${stats.totalBookings > 0 ? formatCurrency(Math.round(totalRevenue / stats.totalBookings)) : 'N/A'}`,
    '',
    '--- Top 5 Most Rented ---',
  ];

  topEquipIds.forEach(([equipId, cnt], idx) => {
    const name = equipMap.get(equipId) || 'Unknown';
    lines.push(`  ${idx + 1}. ${name} (${cnt} bookings)`);
  });

  lines.push('');
  lines.push('--- Equipment Health ---');
  lines.push(`  Total Equipment: ${totalEquipCount ?? 0}`);
  lines.push(`  Idle (30+ days): ${idleCount}`);
  lines.push(
    `  Utilization Rate: ${totalEquipCount ? (((totalEquipCount - idleCount) / totalEquipCount) * 100).toFixed(1) : 0}%`
  );

  if (sortedMonths.length > 0) {
    lines.push('');
    lines.push('--- Monthly Revenue Trend ---');
    sortedMonths.forEach(([month, revenue]) => {
      lines.push(`  ${month}: ${formatCurrency(revenue)}`);
    });
  }

  lines.push('');
  lines.push(formatPlatformStats(stats));

  return buildResult(
    lines.join('\n'),
    ['bookings table', 'equipment table', 'platform stats (analytics overview)'],
    true,
    'analytics_overview',
    'real-time'
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function smartQuery(
  userMessage: string,
  userContext?: SmartQueryUserContext
): Promise<SmartQueryResult> {
  // Handle empty or whitespace-only messages
  if (!userMessage || userMessage.trim().length === 0) {
    return {
      context: '',
      sources: [],
      hasContext: false,
      hasData: false,
      queryType: 'empty',
      dataFreshness: 'real-time',
    };
  }

  const intent = detectIntent(userMessage);

  try {
    switch (intent.type) {
      case 'count_equipment':
        return await handleCountEquipment();

      case 'count_equipment_category':
        return await handleCountEquipmentCategory(intent.category!);

      case 'list_equipment':
        return await handleListEquipment();

      case 'list_equipment_category':
        return await handleListEquipmentCategory(intent.category!);

      case 'search_equipment':
        return await handleSearchEquipment(intent.searchTerm!);

      case 'available_equipment':
        return await handleAvailableEquipment();

      case 'count_labour':
        return await handleCountLabour();

      case 'list_labour':
        return await handleListLabour();

      case 'available_labour':
        return await handleAvailableLabour();

      case 'count_users':
        return await handleCountUsers();

      case 'list_users':
        return await handleListUsers(userContext);

      case 'count_reviews':
        return await handleCountReviews();

      case 'list_reviews':
        return await handleListReviews();

      case 'reviews_for_equipment':
        return await handleReviewsForEquipment(intent.searchTerm!);

      case 'count_bookings':
        return await handleCountBookings();

      case 'list_bookings':
        return await handleListBookings(userContext);

      case 'booking_status':
        return await handleBookingStatus(intent.status!);

      case 'platform_stats':
        return await handlePlatformStats();

      case 'my_bookings':
        if (!userContext?.userId) return makeAuthRequiredResult('bookings');
        return await handleMyBookings(userContext.userId);

      case 'my_booking_status':
        if (!userContext?.userId) return makeAuthRequiredResult('bookings');
        return await handleMyBookingStatus(userContext.userId, intent.status!);

      case 'my_equipment':
        if (!userContext?.userId) return makeAuthRequiredResult('equipment');
        return await handleMyEquipment(userContext.userId);

      case 'my_profile':
        if (!userContext?.userId) return makeAuthRequiredResult('profile');
        return await handleMyProfile(userContext.userId);

      case 'my_reviews':
        if (!userContext?.userId) return makeAuthRequiredResult('reviews');
        return await handleMyReviews(userContext.userId);

      case 'analytics_most_rented':
        return await handleAnalyticsMostRented();

      case 'analytics_revenue':
        return await handleAnalyticsRevenue();

      case 'analytics_idle_equipment':
        return await handleAnalyticsIdleEquipment();

      case 'analytics_overview':
        return await handleAnalyticsOverview();

      case 'vector_search':
      default:
        return await handleVectorSearch(userMessage);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[smart-query-service] Unhandled error for intent ${intent.type}:`, errorMsg);
    return makeErrorResult(intent.type, `Unexpected error: ${errorMsg}`);
  }
}
