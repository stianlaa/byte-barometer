type DocumentId = {
  id: string;
  partIndex: number;
};

export const parseId = (id: string): DocumentId => {
  // Id's are in the form {id}-{partIndex}
  const parts = id.split("-");
  return { id: parts[0], partIndex: parseInt(parts[1]) };
};
