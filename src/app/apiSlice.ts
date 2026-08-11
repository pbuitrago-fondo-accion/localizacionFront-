import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://app-rio-dev-general-wus2-c4e9e0dva3d2awcn.westus2-01.azurewebsites.net/',
  }),
  tagTypes: ['Pais', 'Departamento', 'Municipio'],
  endpoints: () => ({}),
});
