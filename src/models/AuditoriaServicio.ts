import { Schema, model } from 'mongoose';

interface IAuditoriaServicio {
	metodo: string;
	servicio: string;
	peticion: string;
	respuesta: string;
	createdAt?: Date;
	updatedAt?: Date;
}

const AuditoriaServicioSchema = new Schema<IAuditoriaServicio>(
	{
		metodo: { type: String, required: true },
		servicio: { type: String, required: true },
		peticion: { type: String, required: true },
		respuesta: { type: String, required: true },
	},
	{ timestamps: true }
);

export const AuditoriaServicio = model<IAuditoriaServicio>(
	'auditoria_servicio',
	AuditoriaServicioSchema
);
