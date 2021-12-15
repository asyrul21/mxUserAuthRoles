const defaultUserTypes = [
  {
    name: "superAdmin",
    description: "Application Super or Root Administrator",
    nonDeletable: true,
  },
  {
    name: "admin",
    description: "Application Administrator",
    nonDeletable: true,
  },
  {
    name: "generic",
    description: "Normal users or customers",
    nonDeletable: true,
  },
];

module.exports = defaultUserTypes;
