// Location Clusters Definition
export const CLUSTERS = {
  // Metro Vancouver
  VAN_CORE: ['Vancouver', 'Burnaby', 'New Westminster'],
  VAN_NORTH: ['North Vancouver', 'West Vancouver'],
  VAN_SOUTH: ['Richmond', 'Delta'],
  VAN_TRI: ['Coquitlam', 'Port Moody', 'Port Coquitlam'],
  VAN_FRASER: ['Surrey', 'Langley', 'White Rock'],
  
  // Greater Toronto Area
  TORONTO_CORE: ['Toronto', 'North York', 'Scarborough', 'Etobicoke', 'East York'],
  GTA_PEEL: ['Mississauga', 'Brampton'],
  GTA_YORK: ['Vaughan', 'Markham', 'Richmond Hill'],
  GTA_DURHAM: ['Ajax', 'Pickering', 'Whitby', 'Oshawa'],
  GTA_HALTON: ['Oakville', 'Burlington', 'Milton']
};

export const CLUSTER_DISPLAY_NAMES = {
  VAN_CORE: 'Vancouver Core',
  VAN_NORTH: 'North Shore',
  VAN_SOUTH: 'Richmond/South',
  VAN_TRI: 'Tri-Cities',
  VAN_FRASER: 'Fraser',
  TORONTO_CORE: 'Toronto Core',
  GTA_PEEL: 'Peel',
  GTA_YORK: 'York',
  GTA_DURHAM: 'Durham',
  GTA_HALTON: 'Halton'
};

export const CLUSTER_GROUPS = {
  'Metro Vancouver': [
    'VAN_CORE',
    'VAN_NORTH',
    'VAN_SOUTH',
    'VAN_TRI',
    'VAN_FRASER'
  ],
  'Greater Toronto Area': [
    'TORONTO_CORE',
    'GTA_PEEL',
    'GTA_YORK',
    'GTA_DURHAM',
    'GTA_HALTON'
  ]
};

/**
 * Given a city string, return the matching cluster key.
 * If no match is found, returns 'UNKNOWN_CLUSTER'.
 */
export function getClusterFromCity(city) {
  if (!city) return 'UNKNOWN_CLUSTER';
  
  const searchCity = city.toLowerCase().trim();
  
  for (const [clusterId, cities] of Object.entries(CLUSTERS)) {
    if (cities.some(c => c.toLowerCase() === searchCity)) {
      return clusterId;
    }
  }
  
  return 'UNKNOWN_CLUSTER';
}
