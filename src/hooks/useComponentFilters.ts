import { useState, useMemo } from "react";
import { ComponentDocument } from "../firebase/firestore";
import { filterComponents } from "../utils";

interface UseComponentFiltersReturn {
  searchTerm: string;
  filterBrand: string;
  filterContext: string;
  setSearchTerm: (value: string) => void;
  setFilterBrand: (value: string) => void;
  setFilterContext: (value: string) => void;
  filteredComponents: ComponentDocument[];
  clearFilters: () => void;
}

/**
 * Custom hook for managing component filtering and search
 */
export const useComponentFilters = (
  components: ComponentDocument[]
): UseComponentFiltersReturn => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterContext, setFilterContext] = useState("all");

  const filteredComponents = useMemo(
    () => filterComponents(components, searchTerm, filterBrand, filterContext),
    [components, searchTerm, filterBrand, filterContext]
  );

  const clearFilters = () => {
    setSearchTerm("");
    setFilterBrand("all");
    setFilterContext("all");
  };

  return {
    searchTerm,
    filterBrand,
    filterContext,
    setSearchTerm,
    setFilterBrand,
    setFilterContext,
    filteredComponents,
    clearFilters,
  };
};
