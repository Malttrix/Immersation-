/** Only the independently provisioned, approved staging origin is accepted. */
export const WORDPRESS_STAGING_ORIGIN = 'https://staging-cms.immersation.com';
export function isWordPressStagingOrigin(value) {
  return value === WORDPRESS_STAGING_ORIGIN || value === `${WORDPRESS_STAGING_ORIGIN}/`;
}
