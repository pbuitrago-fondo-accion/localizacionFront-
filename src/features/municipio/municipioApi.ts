import { apiSlice } from '../../app/apiSlice';
import type { Municipio, MunicipioRequest } from './types';

export const municipioApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMunicipios: builder.query<Municipio[], void>({
      query: () => 'api/Municipio',
      providesTags: ['Municipio'],
    }),
    getMunicipioById: builder.query<Municipio, number>({
      query: (id) => `api/Municipio/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Municipio', id }],
    }),
    createMunicipio: builder.mutation<Municipio, MunicipioRequest>({
      query: (body) => ({ url: 'api/Municipio', method: 'POST', body }),
      invalidatesTags: ['Municipio'],
    }),
    updateMunicipio: builder.mutation<Municipio, MunicipioRequest>({
      query: (body) => ({ url: `api/Municipio/${body.municipioId}`, method: 'PUT', body }),
      invalidatesTags: ['Municipio'],
    }),
    deleteMunicipio: builder.mutation<void, number>({
      query: (id) => ({ url: `api/Municipio/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Municipio'],
    }),
  }),
});

export const {
  useGetMunicipiosQuery,
  useGetMunicipioByIdQuery,
  useCreateMunicipioMutation,
  useUpdateMunicipioMutation,
  useDeleteMunicipioMutation,
} = municipioApi;
