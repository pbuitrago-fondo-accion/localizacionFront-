import { apiSlice } from '../../app/apiSlice';
import type { Pais, PaisRequest } from './types';

export const paisApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPaises: builder.query<Pais[], void>({
      query: () => 'api/Pais',
      providesTags: ['Pais'],
    }),
    getPaisById: builder.query<Pais, number>({
      query: (id) => `api/Pais/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Pais', id }],
    }),
    createPais: builder.mutation<Pais, PaisRequest>({
      query: (body) => ({ url: 'api/Pais', method: 'POST', body }),
      invalidatesTags: ['Pais'],
    }),
    updatePais: builder.mutation<Pais, PaisRequest>({
      query: (body) => ({ url: `api/Pais/${body.paisId}`, method: 'PUT', body }),
      invalidatesTags: ['Pais'],
    }),
    deletePais: builder.mutation<void, number>({
      query: (id) => ({ url: `api/Pais/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Pais'],
    }),
  }),
});

export const {
  useGetPaisesQuery,
  useGetPaisByIdQuery,
  useCreatePaisMutation,
  useUpdatePaisMutation,
  useDeletePaisMutation,
} = paisApi;
