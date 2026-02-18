// System context utilities for AI chatbot — provides real-time date, time,
// and Indian farming-season awareness so the model can give seasonally
// relevant responses.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserContext {
  isAuthenticated: boolean;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  roles?: string[];
  activeRole?: string;
  location?: {
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export interface FarmingSeason {
  name: 'Kharif' | 'Rabi' | 'Zaid' | 'Pre-Kharif Preparation';
  description: string;
  months: string;
  crops: string[];
  equipmentDemand: string[];
}

export interface SystemContext {
  dateTime: string;
  date: string;
  time: string;
  dayOfWeek: string;
  month: string;
  year: number;
  season: FarmingSeason;
}

// ---------------------------------------------------------------------------
// IST formatting helpers (UTC+5:30, Asia/Kolkata)
// ---------------------------------------------------------------------------

const IST_TIMEZONE = 'Asia/Kolkata';

function getISTDate(): Date {
  // Create a formatter that outputs the individual parts in IST so we can
  // reconstruct a reliable Date-like representation regardless of the
  // server's local timezone.
  return new Date();
}

function formatISTParts() {
  const now = getISTDate();

  const dateFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const partExtractor = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const parts = partExtractor.formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  return {
    dateString: dateFormatter.format(now),
    timeString: `${timeFormatter.format(now)} IST`,
    dayOfWeek: get('weekday'),
    monthName: get('month'),
    year: Number(get('year')),
    monthNumber: now.toLocaleString('en-IN', { timeZone: IST_TIMEZONE, month: 'numeric' }),
  };
}

// ---------------------------------------------------------------------------
// Farming season logic
// ---------------------------------------------------------------------------

const SEASONS: Record<string, FarmingSeason> = {
  kharif: {
    name: 'Kharif',
    description:
      'Monsoon cropping season. Fields are sown at the onset of the south-west monsoon and harvested in autumn.',
    months: 'June to October',
    crops: ['Rice', 'Maize', 'Cotton', 'Soybean', 'Sugarcane'],
    equipmentDemand: ['Tractors', 'Ploughs', 'Seeders', 'Sprayers', 'Irrigation Equipment'],
  },
  rabi: {
    name: 'Rabi',
    description:
      'Winter cropping season. Crops are sown after the monsoon recedes and harvested in spring.',
    months: 'November to March',
    crops: ['Wheat', 'Barley', 'Mustard', 'Peas', 'Gram'],
    equipmentDemand: ['Harvesters', 'Threshers', 'Cultivators', 'Sprayers'],
  },
  zaid: {
    name: 'Zaid',
    description:
      'Short summer cropping season between Rabi and Kharif. Quick-growing crops are cultivated with irrigation.',
    months: 'March to June',
    crops: ['Watermelon', 'Muskmelon', 'Cucumber', 'Moong Dal', 'Fodder'],
    equipmentDemand: ['Irrigation Equipment', 'Sprayers', 'Cultivators'],
  },
  preKharif: {
    name: 'Pre-Kharif Preparation',
    description:
      'Land preparation phase before the monsoon. Farmers plough and level fields to be ready for Kharif sowing.',
    months: 'May to June',
    crops: ['Watermelon', 'Muskmelon', 'Cucumber', 'Moong Dal', 'Fodder'],
    equipmentDemand: ['Tractors', 'Ploughs', 'Rotavators', 'Cultivators'],
  },
};

/**
 * Returns the current (or specified) Indian farming season.
 *
 * Month mapping (1-indexed):
 *   Jan (1)  → Rabi
 *   Feb (2)  → Rabi
 *   Mar (3)  → Zaid  (late Rabi / early Zaid — use Zaid)
 *   Apr (4)  → Zaid
 *   May (5)  → Pre-Kharif Preparation
 *   Jun (6)  → Pre-Kharif Preparation  (overlap with Kharif start — use Pre-Kharif)
 *   Jul (7)  → Kharif
 *   Aug (8)  → Kharif
 *   Sep (9)  → Kharif
 *   Oct (10) → Kharif
 *   Nov (11) → Rabi
 *   Dec (12) → Rabi
 */
export function getFarmingSeason(month?: number): FarmingSeason {
  const m =
    month ??
    Number(
      new Intl.DateTimeFormat('en-IN', { timeZone: IST_TIMEZONE, month: 'numeric' }).format(
        new Date()
      )
    );

  if (m >= 7 && m <= 10) return SEASONS.kharif;
  if (m === 5 || m === 6) return SEASONS.preKharif;
  if (m >= 3 && m <= 4) return SEASONS.zaid;
  // Jan, Feb, Nov, Dec → Rabi
  return SEASONS.rabi;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns an object with the current IST date/time and farming season info.
 */
export function getSystemContext(): SystemContext {
  const { dateString, timeString, dayOfWeek, monthName, year, monthNumber } = formatISTParts();
  const season = getFarmingSeason(Number(monthNumber));

  return {
    dateTime: `${dateString}, ${timeString}`,
    date: dateString,
    time: timeString,
    dayOfWeek,
    month: monthName,
    year,
    season,
  };
}

/**
 * Returns a formatted string ready to be injected into the AI system prompt.
 */
export function formatSystemContextForPrompt(): string {
  const ctx = getSystemContext();

  const seasonTips: Record<FarmingSeason['name'], string> = {
    Kharif:
      'This is sowing season — farmers need tractors, ploughs, and seeders. Irrigation setup is also critical.',
    Rabi: 'This is harvest season — farmers may need harvesters and threshers urgently.',
    Zaid: 'This is a short summer crop window — irrigation equipment is essential due to heat.',
    'Pre-Kharif Preparation':
      'Farmers are preparing land for monsoon sowing — ploughs, rotavators, and tractors are in high demand.',
  };

  const lines = [
    `📅 Current Date & Time: ${ctx.dateTime}`,
    `🌾 Current Farming Season: ${ctx.season.name} (${getSeasonSubtitle(ctx.season.name)})`,
    `   - Season Period: ${ctx.season.months}`,
    `   - Common Crops: ${ctx.season.crops.join(', ')}`,
    `   - Equipment in High Demand: ${ctx.season.equipmentDemand.join(', ')}`,
    `   - Tip: ${seasonTips[ctx.season.name]}`,
  ];

  return lines.join('\n');
}

function getSeasonSubtitle(name: FarmingSeason['name']): string {
  switch (name) {
    case 'Kharif':
      return 'Monsoon Crops';
    case 'Rabi':
      return 'Winter Crops';
    case 'Zaid':
      return 'Summer Crops';
    case 'Pre-Kharif Preparation':
      return 'Land Preparation';
  }
}

/**
 * Formats user context into a string for the AI system prompt.
 */
export function formatUserContextForPrompt(userContext: UserContext): string {
  if (!userContext.isAuthenticated) {
    return [
      '👤 User: Not logged in (Guest)',
      '⚠️ Cannot access personal data (bookings, equipment, profile) — user must log in first.',
    ].join('\n');
  }

  const lines: string[] = [];

  // Name
  const displayName = userContext.name ?? 'Unknown User';
  lines.push(`👤 User: ${displayName}`);

  // Roles
  if (userContext.roles && userContext.roles.length > 0) {
    const roleParts: string[] = [];
    for (const role of userContext.roles) {
      const label = formatRoleLabel(role);
      if (role === userContext.activeRole) {
        roleParts.unshift(`${label} (Active)`);
      } else {
        roleParts.push(label);
      }
    }

    const otherRoles = roleParts.slice(1);
    let roleString = `🔑 Role: ${roleParts[0]}`;
    if (otherRoles.length > 0) {
      roleString += ` | Also: ${otherRoles.join(', ')}`;
    }
    lines.push(roleString);
  }

  // Location
  if (userContext.location) {
    const { city, state, pincode } = userContext.location;
    const locationParts = [city, state].filter(Boolean).join(', ');
    const locationString = pincode ? `${locationParts} ${pincode}` : locationParts;
    if (locationString.trim()) {
      lines.push(`📍 Location: ${locationString}`);
    }
  }

  return lines.join('\n');
}

function formatRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    farmer: 'Farmer',
    provider: 'Equipment Provider',
    admin: 'Administrator',
  };
  return labels[role] ?? role.charAt(0).toUpperCase() + role.slice(1);
}
