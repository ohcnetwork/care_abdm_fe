const BLACKLISTED_QUERY_PARAMS = ["page", "limit"];

const getRedactedUrl = () => {
  const url = new URL(window.location.href);

  // Remove all blacklisted and empty query parameters
  [...url.searchParams.entries()].map(([key, value]) => {
    if (value === "" || BLACKLISTED_QUERY_PARAMS.includes(key)) {
      url.searchParams.delete(key);
    }
  });

  return (
    url
      .toString()
      // Replace all uuids in the URL with "ID_REDACTED"
      .replace(
        /[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}/gi,
        "ID_REDACTED"
      )
      // Replace all numbers in the URL's path params with "ID_REDACTED"
      .replace(/\/\d+/g, "/ID_REDACTED")
  );
};

/**
 * Send a custom event to Plausible
 * @param event Name of the event
 * @param data Additional data to send with the event
 */
const plausible = (event: string, data: object = {}) => {
  const plausible = (window as any).plausible;

  if (plausible) {
    plausible(event, { ...data, u: getRedactedUrl() });
  }
};

/**
 * Trigger a custom event
 * @param name Name of the event
 * @param props Additional properties to send with the event
 * @example
 * triggerGoal("Add New Location");
 * triggerGoal("Add New Location", { locationId: "123" });
 *
 */
export const triggerGoal = (name: string, props: object) => {
  plausible(name, { props });
};
