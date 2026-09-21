// A curated list of first names that are almost exclusively male in German-
// speaking contexts, used only to decide whether to show the (optional)
// cycle-tracking question during onboarding by default. This is a heuristic,
// not an identity check: unrecognized, international or unisex names default
// to showing the question, and the UI always offers a way to reveal it
// anyway if the guess was wrong.
const MALE_FIRST_NAMES = new Set(
  [
    // Klassisch / älter
    "hans", "peter", "klaus", "werner", "horst", "günther", "guenther", "günter", "guenter",
    "helmut", "wolfgang", "manfred", "dieter", "rainer", "gerhard", "herbert", "rolf", "uwe",
    "jürgen", "juergen", "karl", "heinz", "erwin", "kurt", "walter", "erich", "fritz", "otto",
    "wilhelm", "friedrich", "rudolf", "siegfried", "bernd", "bernhard", "reinhard", "norbert",
    "detlef", "frank", "ralf", "axel", "volker", "jörg", "joerg", "holger", "lothar", "harald",
    "egon", "gustav", "alfred", "ernst", "hermann", "ludwig", "anton", "josef", "joseph",
    "franz", "georg", "paul", "richard", "wilfried", "helmuth", "gunter", "arno", "willi",
    "willy", "heinrich", "eugen", "emil", "albert", "alois", "hubert", "reinhold",

    // Mittlere Generation
    "thomas", "michael", "andreas", "christian", "stefan", "stephan", "markus", "marco",
    "sven", "torsten", "dirk", "matthias", "martin", "oliver", "ralph", "thorsten", "carsten",
    "kai", "jan", "sebastian", "tobias", "alexander", "daniel", "florian", "philipp",
    "christoph", "patrick", "marcel", "benjamin", "maximilian", "max", "simon", "fabian",
    "julian", "dominik", "jonas", "niklas", "lukas", "lucas", "felix", "moritz", "david",
    "tim", "timo", "yannick", "jannik", "robert", "roland", "achim", "joachim", "gunnar",
    "jens", "hendrik", "henrik", "sascha", "swen", "guido", "burkhard", "gerald", "gerd",
    "ulrich", "wolf", "reiner", "meinhard", "wendelin", "eckhard", "eckehard",

    // Jüngere Generation / aktuell beliebt
    "leon", "finn", "elias", "noah", "ben", "henry", "emil", "theo", "milan", "luca", "erik",
    "nico", "robin", "jakob", "tom", "adrian", "aaron", "mika", "levi", "linus", "oskar",
    "oscar", "matteo", "luis", "louis", "julius", "vincent", "constantin", "konstantin",
    "maximilian", "bastian", "nils", "arne", "malte", "till", "tilman", "johannes", "jonathan",
    "benedikt", "valentin", "raphael", "lorenz", "cornelius", "leander", "silas",
    "damian", "marlon", "colin", "bruno", "anton", "emilio", "amir", "kian",

    // Häufige internationale Männernamen
    "john", "james", "william", "charles", "mark", "george", "kenneth", "edward", "brian",
    "ronald", "anthony", "kevin", "jason", "jeffrey", "ryan", "jacob", "gary", "nicholas",
    "eric", "stephen", "larry", "justin", "scott", "brandon", "samuel", "gregory", "raymond",
    "jack", "dennis", "jerry", "tyler", "douglas", "nathan", "zachary", "kyle", "harold",
    "carl", "arthur", "gerald", "roger", "keith", "jeremy", "terry", "lawrence", "sean",
    "ethan", "austin", "joe", "bryan", "bruce", "roy", "eugene", "louis", "philip", "bobby",
    "johnny", "wayne", "mohammed", "muhammad", "ali", "ahmed", "omar", "yusuf", "ibrahim",
    "luca", "matteo", "diego", "carlos", "miguel", "pablo", "juan", "antonio", "francesco",
    "giovanni", "marco", "alessandro", "pierre", "jean", "nicolas", "hugo",
  ].map((name) => name.toLowerCase()),
);

export function looksLikeMaleFirstName(firstName: string): boolean {
  return MALE_FIRST_NAMES.has(firstName.trim().toLowerCase());
}
