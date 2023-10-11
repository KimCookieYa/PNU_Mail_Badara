export function getColorByCode(code: string): string {
  switch (code[0]) {
    case "a":
      return "red-600";
    case "b":
      return "green-600";
    case "c":
      return "blue-600";
    case "d":
      return "yellow-600";
    case "e":
      return "purple-600";
    case "f":
      return "pink-600";
    case "g":
      return "indigo-600";
    case "h":
      return "orange-600";
    case "i":
      return "gray-600";
    case "m":
      return "cyan-600";
    default:
      return "white";
  }
}
