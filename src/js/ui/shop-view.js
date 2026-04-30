export function initialShopTab(tabs) {
  return (tabs && tabs[0] && tabs[0].id) || 'armory';
}

export function contentModeForTab(tabId) {
  return tabId === 'armory' ? 'armory' : 'items';
}
