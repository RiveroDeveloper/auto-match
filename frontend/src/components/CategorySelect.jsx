import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { getCategories } from '../services/categoryService';

export default function CategorySelect({ value, onChange }) {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, []);

    return (
        <select name="category_id" value={value} onChange={onChange}>
            <option value="">{t('admin.selectCategory')}</option>
            {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
            ))}
        </select>
    );
}