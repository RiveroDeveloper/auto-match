import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./Hero.css";
import { getMakes } from "../services/makeService";

const Hero = ({ onSearch }) => {
  const { t } = useTranslation();
  const [searchData, setSearchData] = useState({
    brand: "",
    model: "",
    budget: "",
  });
  const [makes, setMakes] = useState([]);

  useEffect(() => {
    const loadMakes = async () => {
      try {
        const makesData = await getMakes();
        setMakes(makesData);
      } catch (error) {
        console.error("Error loading makes:", error);
      }
    };
    loadMakes();
  }, []);

  const handleSearchChange = (field, value) => {
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Hero search submitted with data:", searchData);
    if (onSearch) {
      onSearch(searchData);
    }
  };

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-overlay"></div>
        <div className="hero-pattern"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span>{t("hero.badge")}</span>
          </div>

          <h1 className="hero-title text-glow">{t("hero.title")}</h1>

          <p className="hero-subtitle">{t("hero.subtitle")}</p>

          <form className="hero-search glass-effect" onSubmit={handleSearch}>
            <div className="search-fields">
              <div className="search-field">
                <label className="field-label">{t("hero.brandLabel")}</label>
                <div className="input-container">
                  <select
                    value={searchData.brand}
                    onChange={(e) =>
                      handleSearchChange("brand", e.target.value)
                    }
                    className="search-select"
                  >
                    <option value="">{t("hero.brandPlaceholder")}</option>
                    {makes.map((make) => (
                      <option key={make.id} value={make.name}>
                        {make.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="dropdown-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </div>
              </div>

              <div className="search-field">
                <label className="field-label">{t("hero.modelLabel")}</label>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder={t("hero.modelPlaceholder")}
                    value={searchData.model}
                    onChange={(e) =>
                      handleSearchChange("model", e.target.value)
                    }
                    className="search-input"
                  />
                </div>
              </div>

              <div className="search-field">
                <label className="field-label">{t("hero.budgetLabel")}</label>
                <div className="input-container">
                  <select
                    value={searchData.budget}
                    onChange={(e) =>
                      handleSearchChange("budget", e.target.value)
                    }
                    className="search-select"
                  >
                    <option value="">{t("hero.budgetPlaceholder")}</option>
                    <option value="0-15000">
                      {t("hero.budgetRanges.0-15000")}
                    </option>
                    <option value="15000-30000">
                      {t("hero.budgetRanges.15000-30000")}
                    </option>
                    <option value="30000-45000">
                      {t("hero.budgetRanges.30000-45000")}
                    </option>
                    <option value="45000-60000">
                      {t("hero.budgetRanges.45000-60000")}
                    </option>
                    <option value="60000+">
                      {t("hero.budgetRanges.60000+")}
                    </option>
                  </select>
                  <svg
                    className="dropdown-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary search-button btn-enhanced hover-glow"
            >
              <span>{t("hero.findButton")}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
