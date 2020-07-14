export default ({ app }, inject) => {
  const goto = (route) => {
    if (typeof route === 'string' && route.includes('://')) {
      window.location.href = route;
    } else if (typeof route === 'object' && route.path.includes('://')) {
      const url = new URL(route.path);
      url.search = new URLSearchParams(route.query);
      window.location.href = url.toString();
    } else {
      app.router.push(route);
    }
  };

  inject('goto', goto);
};
