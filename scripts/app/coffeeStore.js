define([], function () {
  let coffees = {};

  function add(coffee) {
    if (coffee.hasOwnProperty('id')) coffees[coffee.id] = coffee;
  }

  function pop(id) {
    if (exist(id)) {
      // shallow copy object
      let coffee = {};
      Object.assign(coffee, coffees[id]);
      remove(id);
      return coffee;
    } else return null;
  }

  function remove(id) {
    delete coffees[id];
  }

  function find(id) {
    if (exist(id)) {
      return coffees[id];
    } else return null;
  }

  function exist(id) {
    return coffees.hasOwnProperty(id);
  }

  return { add, remove, pop, find };
});
