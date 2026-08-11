import { apiSlice } from '../../app/apiSlice';
import type { Departamento, DepartamentoRequest } from './types';

export const departamentoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartamentos: builder.query<Departamento[], void>({
      query: () => 'api/Departamento',
      providesTags: ['Departamento'],
    }),
    getDepartamentoById: builder.query<Departamento, number>({
      query: (id) => `api/Departamento/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Departamento', id }],
    }),
    createDepartamento: builder.mutation<Departamento, DepartamentoRequest>({
      query: ({ departamentoId: _id, ...body }) => ({ url: 'api/Departamento', method: 'POST', body }),
      invalidatesTags: ['Departamento'],
    }),
    updateDepartamento: builder.mutation<Departamento, DepartamentoRequest>({
      query: (body) => ({ url: `api/Departamento/${body.departamentoId}`, method: 'PUT', body }),
      invalidatesTags: ['Departamento'],
    }),
    deleteDepartamento: builder.mutation<void, number>({
      query: (id) => ({ url: `api/Departamento/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Departamento'],
    }),
  }),
});

export const {
  useGetDepartamentosQuery,
  useGetDepartamentoByIdQuery,
  useCreateDepartamentoMutation,
  useUpdateDepartamentoMutation,
  useDeleteDepartamentoMutation,
} = departamentoApi;
