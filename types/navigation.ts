// types/navigation.ts
export type RootStackParamList = {
  Templates: undefined; // No params
  EditTemplate: { templateId?: string }; // Optional for creating a new template
  Exercises: undefined;
};
