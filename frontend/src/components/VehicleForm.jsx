import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createVehicle } from '../services/vehicleService';
import MakeSelect from './MakeSelect';
import CategorySelect from './CategorySelect';
import './VehicleForm.css';

export default function VehicleForm({ vehicleCreated }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        model: '',
        year: '',
        color: '',
        price: '',
        make_id: '',
        category_id: '',
        image: null,
    });

    // actualizar el estado formData
    // event.target → elemento
    // event.target.name → atributo del modelo
    // event.target.value → valor del elemento

    const handleChange = (event) => {
        setFormData({...formData, [event.target.name]: event.target.value});
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.model || !formData.year || !formData.color || !formData.price || !formData.make_id || !formData.category_id) {
            alert(t('admin.allFieldsRequired'));
            return;
        }

        const formPayload = new FormData();
        formPayload.append('model', formData.model);
        formPayload.append('year', Number(formData.year));
        formPayload.append('color', formData.color);
        formPayload.append('price', Number(formData.price));
        formPayload.append('make', Number(formData.make_id));
        formPayload.append('category', Number(formData.category_id));
        if (formData.image) formPayload.append('image', formData.image);

        try {
            const newVehicle = await createVehicle(formPayload);
            vehicleCreated(newVehicle);
            setFormData({ model: '', year: '', color: '', price: '', make_id: '', category_id: '', image: null });
            // Resetear el input de archivo
            const fileInput = document.getElementById('image-input');
            if (fileInput) {
                fileInput.value = '';
            }
        } catch (err) {
            console.error("Error al crear vehículo:", err.response?.data || err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="vehicle-form">

            <h2>{t('admin.registerVehicle')}</h2>

            <input name="model" placeholder={t('admin.model')} value={formData.model} onChange={handleChange} />
            <input name="year" placeholder={t('admin.year')} value={formData.year} onChange={handleChange} />
            <input name="color" placeholder={t('admin.color')} value={formData.color} onChange={handleChange} />
            <input name="price" placeholder={t('admin.price')} value={formData.price} onChange={handleChange} />

            <MakeSelect value={formData.make_id} onChange={handleChange} />
            <CategorySelect value={formData.category_id} onChange={handleChange} />

            <div className="file-input-wrapper">
              <input 
                type="file" 
                name="image" 
                id="image-input"
                accept="image/*"
                onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                className="file-input-hidden"
              />
              <label htmlFor="image-input" className="file-input-label">
                {formData.image ? formData.image.name : t('admin.selectFile')}
              </label>
            </div>

            <button type="submit">{t('admin.register')}</button>
        </form>
    );
}


