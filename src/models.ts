import { Observable } from "rxjs";

export type GrowthForm = 'Bunch' | 'Colonizing' | 'Multiple Stem' | 'Rhizomatous' | 'Single Crown' | 'Single Stem' | 'Stoloniferous' | 'Thicket Forming';
export type Color = 'Black' | 'Blue' | 'Brown' | 'Green' | 'Orange' | 'Purple' | 'Red' | 'White' | 'Yellow' | 'Dark Green' | 'Gray-Green' | 'White-Gray' | 'Yellow-Green';
export type Rate = 'Moderate' | 'None' | 'Rapid' | 'Slow';
export type Category = 'Dicot' | 'Fern' | 'Green alga' | 'Gymnosperm' | 'Hornwort' | 'Horsetail' | 'Lichen' | 'Liverwort' | 'Lycopod' | 'Monocot' | 'Moss' | 'Quillwort' | 'RA' | 'Whisk-fern';
export type Level = 'High' | 'Medium' | 'Low' | 'None';
export type Duration = 'Perennial' | 'Biennial' | 'Annual' | 'AN' | 'Any';
export type Season = 'Winter' | 'Spring' | 'Summer' | 'Fall' | 'Year Round';
export type Porosity = 'Dense' | 'Moderate' | 'Porous';
export type ShadeTolerance = 'Intermediate' | 'Intolerant' | 'Tolerant';
export type ShapeAndOrientation = 'Climbing' | 'Columnar' | 'Conical' | 'Decumbent' | 'Erect' | 'Irregular' | 'Oval' | 'Prostrate' | 'Rounded' | 'Semi-Erect' | 'Vase';
export type Lifespan = 'Long' | 'Moderate' | 'Short';
export type Toxicity = 'Severe' | 'Moderate' | 'None' | 'Slight';
export type Texture = 'Coarse' | 'Fine' | 'Medium';
export type CommercialAvailability = 'Contracting Only' | 'Field Collections Only' | 'No Known Source' | 'Routinely Available';
export type NativeStatusCode = 'N' | 'I' | 'N?' | 'I?' | 'NI' | 'NI?' | 'GP' | 'GP?' | 'W' | 'W?' | 'A' | 'H';
export type NativeLocationCode = 'L48' | 'AK' | 'HI' | 'PR' | 'VI' | 'CAN' | 'CA' | 'SPM' | 'NA';
export type GrowthHabit = 'Forb/herb' | 'Shrub' | 'Subshrub' | 'Graminoid' | 'Lichenous' | 'Tree' | 'Nonvascular' | 'Vine' | 'Any';

// US States and Canadian Provinces/Territories for PLANTS Database
export type LocationCode =
  | 'AL' // Alabama
  | 'AK' // Alaska
  | 'AZ' // Arizona
  | 'AR' // Arkansas
  | 'CA' // California
  | 'CO' // Colorado
  | 'CT' // Connecticut
  | 'DC' // Washington DC
  | 'DE' // Delaware
  | 'FL' // Florida
  | 'GA' // Georgia
  | 'HI' // Hawaii
  | 'ID' // Idaho
  | 'IL' // Illinois
  | 'IN' // Indiana
  | 'IA' // Iowa
  | 'KS' // Kansas
  | 'KY' // Kentucky
  | 'LA' // Louisiana
  | 'ME' // Maine
  | 'MD' // Maryland
  | 'MA' // Massachusetts
  | 'MI' // Michigan
  | 'MN' // Minnesota
  | 'MS' // Mississippi
  | 'MO' // Missouri
  | 'MT' // Montana
  | 'NE' // Nebraska
  | 'NV' // Nevada
  | 'NH' // New Hampshire
  | 'NJ' // New Jersey
  | 'NM' // New Mexico
  | 'NY' // New York
  | 'NC' // North Carolina
  | 'ND' // North Dakota
  | 'OH' // Ohio
  | 'OK' // Oklahoma
  | 'OR' // Oregon
  | 'PA' // Pennsylvania
  | 'RI' // Rhode Island
  | 'SC' // South Carolina
  | 'SD' // South Dakota
  | 'TN' // Tennessee
  | 'TX' // Texas
  | 'UT' // Utah
  | 'VT' // Vermont
  | 'VA' // Virginia
  | 'WA' // Washington
  | 'WV' // West Virginia
  | 'WI' // Wisconsin
  | 'WY' // Wyoming

  | 'AB' // Alberta
  | 'BC' // British Columbia
  | 'MB' // Manitoba
  | 'NB' // New Brunswick
  | 'NL' // Newfoundland and Labrador
  | 'NT' // Northwest Territories
  | 'NS' // Nova Scotia
  | 'NU' // Nunavut
  | 'ON' // Ontario
  | 'PE' // Prince Edward Island
  | 'QC' // Quebec
  | 'SK' // Saskatchewan
  | 'YT' // Yukon Territory
  | 'NF' // NewFoundland
  | 'LB' // Labrador

  | 'PR' // Puerto Rico
  | 'VI' // US Virgin Islands
  | 'GU' // Guam
  | 'AS' // American Samoa
  | 'MP'// Northern Mariana Islands  
  | 'PW' // Pacific West/Wake Island region
  | 'UM' // US Minor Outlying Islands
  | 'NAV' // Navajo Nation
  | 'FM'
  | 'MH'; //Marshal islands

// Generate valid codes from the union type
export const validLocationCodes: Set<LocationCode> = new Set([
  // US States
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
  'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
  'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY',
  // Canadian Provinces/Territories
  'AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT', 'NF', 'LB',
  // US Territories
  'PR', 'VI', 'GU', 'AS', 'MP', 'PW', 'UM', 'NAV', 'FM', 'MH'
] as const);

// Mapping from individual location codes to native status regions
export const LocationToNativeRegion: Record<LocationCode, NativeLocationCode[]> = {
  // US States (Lower 48)
  'AL': ['L48', 'NA'], 'AR': ['L48', 'NA'], 'AZ': ['L48', 'NA'], 'CA': ['L48', 'NA'], 'CO': ['L48', 'NA'],
  'CT': ['L48', 'NA'], 'DC': ['L48', 'NA'], 'DE': ['L48', 'NA'], 'FL': ['L48', 'NA'], 'GA': ['L48', 'NA'],
  'IL': ['L48', 'NA'], 'IN': ['L48', 'NA'], 'IA': ['L48', 'NA'], 'KS': ['L48', 'NA'], 'KY': ['L48', 'NA'],
  'LA': ['L48', 'NA'], 'ME': ['L48', 'NA'], 'MD': ['L48', 'NA'], 'MA': ['L48', 'NA'], 'MI': ['L48', 'NA'],
  'MN': ['L48', 'NA'], 'MS': ['L48', 'NA'], 'MO': ['L48', 'NA'], 'MT': ['L48', 'NA'], 'NE': ['L48', 'NA'],
  'NV': ['L48', 'NA'], 'NH': ['L48', 'NA'], 'NJ': ['L48', 'NA'], 'NM': ['L48', 'NA'], 'NY': ['L48', 'NA'],
  'NC': ['L48', 'NA'], 'ND': ['L48', 'NA'], 'OH': ['L48', 'NA'], 'OK': ['L48', 'NA'], 'OR': ['L48', 'NA'],
  'PA': ['L48', 'NA'], 'RI': ['L48', 'NA'], 'SC': ['L48', 'NA'], 'SD': ['L48', 'NA'], 'TN': ['L48', 'NA'],
  'TX': ['L48', 'NA'], 'UT': ['L48', 'NA'], 'VT': ['L48', 'NA'], 'VA': ['L48', 'NA'], 'WA': ['L48', 'NA'],
  'WV': ['L48', 'NA'], 'WI': ['L48', 'NA'], 'WY': ['L48', 'NA'], 'ID': ['L48', 'NA'],

  // Alaska and Hawaii (separate regions)
  'AK': ['AK'],
  'HI': ['HI'],

  // US Territories
  'PR': ['PR'],
  'VI': ['VI'],
  'GU': ['PR'], // Guam often grouped with PR region
  'AS': ['PR'], // American Samoa often grouped with PR region  
  'MP': ['PR'], // Northern Mariana Islands often grouped with PR region
  'PW': ['L48', 'NA'],
  'UM': ['L48', 'NA'],
  'NAV': ['L48', 'NA'],
  'FM': ['L48', 'NA'],
  'MH': ['L48', 'NA'],


  // Canadian Provinces/Territories (all map to CAN)
  'AB': ['CAN'], 'BC': ['CAN'], 'MB': ['CAN'], 'NB': ['CAN'], 'NL': ['CAN'],
  'NT': ['CAN'], 'NS': ['CAN'], 'NU': ['CAN'], 'ON': ['CAN'], 'PE': ['CAN'],
  'QC': ['CAN'], 'SK': ['CAN'], 'YT': ['CAN'], 'NF': ['CAN'], 'LB': ['CAN'],
};

// Helper function to get native region for a location code
export function getNativeRegion(locationCode: LocationCode): NativeLocationCode[] | undefined {
  return LocationToNativeRegion[locationCode];
}

/**
 * L48 - Lower 48 states
AK - Alaska
HI - Hawaii
PR - Puerto Rico
VI - U.S. Virgin Islands
CAN (or CA) - Canada
GL - Greenland (Denmark)
SPM - St. Pierre and Miquelon (France)
NA - North America
 */
// (N) - Native
// (I) - Introduced
// (N?) - Probably Native
// (I?) - Probably Introduced
// (NI) - Native and Introduced
// (NI?) - Probably Native and Introduced
// (GP) - Garden Plant
// (GP?) - Probably Garden Plant
// (W) - Waif
// (W?) - Probably Waif
// (A) - Absent
// H - Historic (no longer present, but was documented historically)


// State and Province column is {COUNTRY_CODE}([ST,ST,ST,...]) OR USA+([PR, VI]) for puerto rico or virgin island or both
// idgaf about the state and province i only care about the damn native status u dolt

// Native statis seems to be like Two letter region (StatusCodeEnum)
// where the enum is either I for invasive or N for Native
//e.g. NA(N), CAN(I)NA(I), L48(I)CAN(I)

//PLANTS Floristic area is a little different as its not status, just occurrences
// TODO use gov ACCEPTED_SYMBOL column / type to query the website
// https://plants.usda.gov/plant-profile/LAENN is the plant profile for
// LAENN aka horseweed
// https://plants.usda.gov/plant-profile/maam/sources gives some plant occurrences / distributions

// Define the camelCase interface for working with the data
// Using Readonly to ensure immutability
export type PlantData = Readonly<{
  acceptedSymbol: string;
  synonymSymbol: string;
  symbol: string;
  scientificName: string;
  plantsFloristicArea: string;
  stateAndProvince: Set<LocationCode>;
  category: Category;
  family: string;
  duration: Set<Duration>;
  growthHabit: Set<GrowthHabit>;
  nativeStateAndProvinceCodes: Set<LocationCode>;
  combinedCountyFIPs: string[];
  characteristicsData: boolean;
  activeGrowthPeriod: ReadonlyArray<Season>;
  afterHarvestRegrowthRate: Rate;
  bloat: Level;
  cnRatio: Level;
  coppicePotential: boolean;
  fallConspicuous: boolean;
  fireResistance: boolean;
  flowerColor: Color;
  flowerConspicuous: boolean;
  foliageColor: Color;
  foliagePorosityWinter: Porosity;
  foliagePorositySummer: Porosity;
  foliageTexture: Texture;
  fruitColor: Color;
  fruitConspicuous: boolean;
  growthForm: GrowthForm;
  growthRate: Rate;
  heightAtBaseAgeMaximumFeet: number;
  heightMatureFeet: number;
  knownAllelopath: boolean;
  leafRetention: boolean;
  lifespan: Lifespan;
  lowGrowingGrass: boolean;
  nitrogenFixation: Level;
  resproutAbility: boolean;
  shapeAndOrientation: ShapeAndOrientation;
  toxicity: Toxicity;
  adaptedToCoarseTexturedSoils: boolean;
  adaptedToMediumTexturedSoils: boolean;
  adaptedToFineTexturedSoils: boolean;
  anaerobicTolerance: Level;
  caco3Tolerance: Level;
  coldStratificationRequired: boolean;
  droughtTolerance: Level;
  fertilityRequirement: Level;
  fireTolerance: Level;
  frostFreeDaysMinimum: number;
  hedgeTolerance: Level;
  moistureUse: Level;
  phMinimum: number;
  phMaximum: number;
  plantingDensityPerAcreMinimum: number;
  plantingDensityPerAcreMaximum: number;
  precipitationMinimum: number;
  precipitationMaximum: number;
  rootDepthMinimumInches: number;
  salinityTolerance: Level;
  shadeTolerance: ShadeTolerance;
  temperatureMinimumF: number;
  bloomPeriod: string;
  commercialAvailability: CommercialAvailability;
  fruitSeedAbundance: Level;
  fruitSeedPeriodBegin: Season;
  fruitSeedPeriodEnd: Season;
  fruitSeedPersistence: boolean;
  propogatedByBareRoot: boolean;
  propogatedByBulbs: boolean;
  propogatedByContainer: boolean;
  propogatedByCorms: boolean;
  propogatedByCuttings: boolean;
  propogatedBySeed: boolean;
  propogatedBySod: boolean;
  propogatedBySprigs: boolean;
  propogatedByTubers: boolean;
  seedsPerPound: number;
  seedSpreadRate: Rate;
  seedlingVigor: Level;
  smallGrain: boolean;
  vegetativeSpreadRate: Rate;
  berryNutSeedProduct: boolean;
  christmasTreeProduct: boolean;
  fodderProduct: boolean;
  fuelwoodProduct: Level;
  lumberProduct: boolean;
  navalStoreProduct: boolean;
  nurseryStockProduct: boolean;
  palatableBrowseAnimal: Level;
  palatableGrazeAnimal: Level;
  palatableHuman: boolean;
  postProduct: boolean;
  proteinPotential: Level;
  pulpwoodProduct: boolean;
  veneerProduct: boolean;
  commonName: string;
}>;

export type County = Omit<CountyCSVItem, 'countyName' | 'stateAbbrev'>

export type ExtraInfo = Readonly<{
  combinedFIPs: string[];
  commonName: string;
}>;

export interface State {
  name: string;
  FIP: number | string;
}

export interface StateCSVItem {
  fip: number,
  abbrev: string,
  name: string,
  gnisid: string
}

export interface CountyCSVItem {
  stateAbbrev: string,
  stateFip: number,
  countyFip: string,
  countyName: string,
}

export interface StateInfo {
  fip: number | string,
  abbreviation: string;
  name: string;
  properties?: unknown;
  country?: string;
  gnisid?: string;
}


export type StateToCounties = Map<State, Set<County>>;

export function combineCountyFIP(county: Readonly<County> | null | undefined): string {
  return county == null || county.stateFip < 0 ? '' : county.stateFip.toString().padStart(2, '0') + county.countyFip.padStart(3, '0');
}


export interface ObservationsResponse {
  total_results?: number;
  page?: number;
  per_page?: number;
  results?: Observation[];
}

export interface ProcessedObservationPhoto extends Observation {
 imageGroups$: Observable<ProcessedPhotoGroup>[];
}

export type CsvObservation = 
  { acceptedSymbol: string } & 
  Pick<Observation, 'id' | 'uuid' | 'observed_on' | 'license_code'| 'location'> 
   & Prefixed<Pick<User, 'name' | 'id' | 'icon_url'>, 'user_'>;

export type CsvObservationPhoto = 
  { acceptedSymbol: string; observation_id: number } & 
  Pick<Photo, 'id' | 'url' | 'attribution' | 'license_code'>;

export interface Observation {
  annotations?: Annotation[];
  id?: number;
  cached_votes_total?: number;
  captive?: boolean;
  comments?: Comment[];
  comments_count?: number;
  created_at?: string;
  created_at_details?: DateDetails;
  created_time_zone?: string;
  description?: string;
  faves_count?: number;
  geojson?: PointGeoJson;
  geoprivacy?: string;
  taxon_geoprivacy?: string;
  id_please?: boolean;
  identifications_count?: number;
  identifications_most_agree?: boolean;
  identifications_most_disagree?: boolean;
  identifications_some_agree?: boolean;
  license_code?: string;
  /** in the format "lat,lng" */
  location?: string;
  /** in the format "lat,lng" */
  private_location?: string;
  mappable?: boolean;
  non_owner_ids?: NonOwnerIdentification[];
  num_identification_agreements?: number;
  num_identification_disagreements?: number;
  obscured?: boolean;
  observed_on?: string;
  observed_on_details?: DateDetails;
  observed_on_string?: string;
  observed_time_zone?: string;
  ofvs?: FieldValue[];
  out_of_range?: boolean;
  photos?: Photo[];
  place_guess?: string;
  private_place_guess?: string;
  place_ids?: number[];
  private_place_ids?: number[];
  positional_accuracy?: number;
  private_geojson?: PointGeoJson;
  project_ids?: number[];
  project_ids_with_curator_id?: number[];
  project_ids_without_curator_id?: number[];
  public_positional_accuracy?: number;
  quality_grade?: string;
  reviewed_by?: number[];
  site_id?: number;
  sounds?: Sound[];
  species_guess?: string;
  tags?: string[];
  taxon?: ObservationTaxon;
  time_observed_at?: string;
  time_zone_offset?: string;
  updated_at?: string;
  uri?: string;
  user?: User;
  uuid?: string;
  verifiable?: boolean;
  observation_photos?: ObservationPhoto[];
  quality_metrics?: QualityMetric[];
  flags?: Flag[];
  community_taxon_id?: number;
  faves?: Fave[];
  identifications?: Identification[];
  oauth_application_id?: number;
  outlinks?: Outlink[];
  owners_identification_from_vision?: boolean;
  preferences?: object;
  project_observations?: ProjectObservation[];
  spam?: boolean;
  votes?: Vote[];
  identification_disagreements_count?: number;
  ident_taxon_ids?: number[];
  map_scale?: number;
}

export interface Annotation {
  uuid?: string;
  controlled_attribute_id?: number;
  controlled_value_id?: number;
  concatenated_attr_val?: string;
  user?: User;
  user_id?: number;
  vote_score?: number;
  votes?: Vote[];
}

export interface Comment {
  id?: number;
  body?: string;
  created_at?: string;
  created_at_details?: DateDetails;
  user?: User;
  flags?: Flag[];
  hidden?: boolean;
  moderator_actions?: ModeratorAction[];
  uuid?: string;
}

export interface DateDetails {
  date?: string;
  day?: number;
  hour?: number;
  month?: number;
  week?: number;
  year?: number;
}

export interface PointGeoJson {
  type?: string;
  /** an array of [long, lat] */
  coordinates?: number[];
}

export interface NonOwnerIdentification {
  id?: number;
  body?: string;
  created_at?: string;
  created_at_details?: DateDetails;
  user?: User;
}

export interface FieldValue {
  name?: string;
  value?: string;
}

export interface Photo {
  id?: number;
  attribution?: string;
  license_code?: string;
  url?: string;
}

export interface Sound {
  id?: number;
  attribution?: string;
  license_code?: string;
}

export interface ObservationTaxon {
  id?: number;
  iconic_taxon_id?: number;
  iconic_taxon_name?: string;
  is_active?: boolean;
  name?: string;
  preferred_common_name?: string;
  rank?: string;
  rank_level?: number;
  ancestor_ids?: number[];
  ancestry?: string;
  conservation_status?: RawConservationStatus;
  endemic?: boolean;
  establishment_means?: EstablishmentMeans;
  introduced?: boolean;
  native?: boolean;
  threatened?: boolean;
}

export interface User {
  created_at?: string;
  id?: number;
  icon?: string;
  icon_url?: string;
  identifications_count?: number;
  journal_posts_count?: number;
  login?: string;
  name?: string;
  observations_count?: number;
  orcid?: string;
  roles?: string[];
  site_id?: number;
  species_count?: number;
  spam?: boolean;
  suspended?: boolean;
}

export interface ObservationPhoto {
  id?: number;
  uuid?: string;
  photo?: Photo;
  position?: number;
}

export interface QualityMetric {
  id?: number;
  user_id?: number;
  metric?: string;
  agree?: boolean;
}

export interface Flag {
  id?: number;
  flag?: string;
  comment?: string;
  resolved?: boolean;
  user?: User;
  created_at?: string;
}

export interface Fave {
  id?: number;
  votable_id?: number;
  created_at?: string;
  user?: User;
}

export type IdentificationCategory = "improving" | "leading" | "maverick" | "supporting";

export interface Identification {
  id?: number;
  observation_id?: number;
  body?: string;
  category?: IdentificationCategory;
  created_at?: string;
  updated_at?: string;
  current?: boolean;
  taxon?: ObservationTaxon;
  previous_observation_taxon?: ObservationTaxon;
  user?: User;
  uuid?: string;
  created_at_details?: DateDetails;
  flags?: Flag[];
  own_observation?: boolean;
  taxon_change?: TaxonChange;
  vision?: boolean;
  disagreement?: boolean;
  previous_observation_taxon_id?: number;
  spam?: boolean;
  hidden?: boolean;
  moderator_actions?: ModeratorAction[];
}

export interface Outlink {
  id?: number;
  source?: string;
  url?: string;
}

export interface ProjectObservation {
  id?: number;
  project_id?: number;
  observation_id?: number;
  curator_identification_id?: number;
  tracking_code?: string;
  prefers_curator_coordinate_access?: boolean;
}

export interface Vote {
  id?: number;
  user_id?: number;
  vote_flag?: boolean;
  vote_scope?: string;
  created_at?: string;
}

export type ModeratorActionType = "hide" | "rename" | "unhide" | "suspend" | "unsuspend";

export interface ModeratorAction {
  id?: number;
  created_at?: string;
  created_at_details?: DateDetails;
  user?: User;
  action?: ModeratorActionType;
  reason?: string;
}

export const IUCNStatus = {
  NOT_EVALUATED: 0,
  DATA_DEFICIENT: 5,
  LEAST_CONCERN: 10,
  NEAR_THREATENED: 20,
  VULNERABLE: 30,
  ENDANGERED: 40,
  CRITICALLY_ENDANGERED: 50,
  EXTINCT_IN_THE_WILD: 60,
  EXTINCT: 70,
} as const;

export type IUCNStatusValue = (typeof IUCNStatus)[keyof typeof IUCNStatus];

export interface RawConservationStatus {
  /** Identifier for the iNat source record associated with this status */
  source_id?: number;
  /** Organization that declared this status */
  authority?: string;
  /** Body of the status, often coded */
  status?: string;
  /** Human-readable name of the status if it was coded */
  status_name?: string;
  /** Coded value representing the equivalent IUCN status */
  iucn?: IUCNStatusValue;
  /** Default geoprivacy for observations of this taxon in the status's place */
  geoprivacy?: string;
}

export interface EstablishmentMeans {
  establishment_means?: string;
  place?: CorePlace;
}

export interface TaxonChange {
  id?: number;
  type?: string;
}

export interface CorePlace {
  id?: number;
  name?: string;
  display_name?: string;
}

export interface TaxaShowResponse {
  total_results?: number;
  page?: number;
  per_page?: number;
  results?: ShowTaxon[];
}

export interface ShowTaxon {
  id?: number;
  iconic_taxon_id?: number;
  iconic_taxon_name?: string;
  is_active?: boolean;
  name?: string;
  preferred_common_name?: string;
  rank?: string;
  rank_level?: number;
  ancestor_ids?: number[];
  colors?: Color[];
  conservation_status?: ConservationStatus;
  conservation_statuses?: TaxonConservationStatus[];
  default_photo?: TaxonPhoto;
  establishment_means?: EstablishmentMeans;
  observations_count?: number;
  preferred_establishment_means?: string;
}

export type Prefixed<T, Prefix extends string> = {
  [K in keyof T as `${Prefix}${string & K}`]: T[K];
};

export type CsvTaxon = { acceptedSymbol: string }  & Pick<ShowTaxon, 'id'|'name'|'preferred_common_name'|'colors'> & Prefixed<TaxonMetadata, 'photo_'>;

export interface ConservationStatus {
  place_id?: number;
  place?: CorePlace;
  status?: string;
}

export interface TaxonConservationStatus {
  /** Identifier for the iNat source record associated with this status */
  source_id?: number;
  /** Organization that declared this status */
  authority?: string;
  /** Body of the status, often coded */
  status?: string;
  /** Human-readable name of the status if it was coded */
  status_name?: string;
  /** Coded value representing the equivalent IUCN status */
  iucn?: IUCNStatusValue;
  /** Default geoprivacy for observations of this taxon in the status's place */
  geoprivacy?: string;
  place?: CorePlace;
}

export interface TaxonPhoto {
  id?: number;
  attribution?: string;
  license_code?: string;
  url?: string;
  medium_url?: string;
  square_url?: string;
}

export type TaxonMetadata = Pick<TaxonPhoto, 'id' | 'attribution' | 'license_code' | 'url'>;

export type ProcessedPhotoGroup = [fullImage: Buffer<ArrayBufferLike>, thumbnail: Buffer<ArrayBufferLike>] | null;

export interface ProcessedTaxonPhoto extends TaxonMetadata { 
  images: ProcessedPhotoGroup;
}

export interface EstablishmentMeans {
  establishment_means?: string;
  place?: CorePlace;
}

export interface CorePlace {
  id?: number;
  name?: string;
  display_name?: string;
}