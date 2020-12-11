// Redirect legacy entity page URLs

export default (route) => {
  const pattern = /^\/portal(\/[a-z]{2})?(\/explore\/(people|topics|times))(\/[0-9]+)/;
  const match = route.path.match(pattern);

  return match ? {
    path: [
      match[1],
      match[2].replace('/explore', '/collections').replace('/people', '/person').replace('/topics', '/topic').replace('/times', '/timespan'),
      match[4]
    ]
  } : null;
};
