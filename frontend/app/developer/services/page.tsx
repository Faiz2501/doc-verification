"use client";

import { useEffect, useState } from "react";
import {
  Fingerprint,
  CreditCard,
  IdCard,
  Globe,
  Building,
  Building2,
  Link,
  Search,
  ArrowLeftRight,
  ScanFace,
  Camera,
  Type,
  Car,
  MapPin,
  Phone,
  Wallet,
  Briefcase,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import api from "@/lib/api/axios";
import ServiceSection from "@/components/services/service-section";
import ServicesToolbar from "@/components/services/services-toolbar";
import ServiceFilters from "@/components/services/service-filters";
import EmptyState from "@/components/services/empty-state";

type ServiceMode =
  | "single"
  | "driving-license"
  | "bank"
  | "pan-udyam"
  | "coming-soon";

type ServiceItem = {
  name: string;
  description: string;
  price: number;
  status: "active" | "live" | "beta";
  icon: React.ReactNode;
  available: boolean;
  mode: ServiceMode;
  endpoint?: string;
  requestKey?: string;
  inputLabel?: string;
  placeholder?: string;
  comingSoonCopy?: string;
};

type DashboardPayload = {
  apiKeys?: Array<{
    id: string;
    apiKey: string;
    isActive: boolean;
  }>;
};

type PricingItem = {
  id: string;
  serviceName: string;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function ServicesPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [activeApiKey, setActiveApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [pricingMap, setPricingMap] = useState<
    Record<string, PricingItem>
  >({});

  const getPrice = (
    backendName: string,
    fallback: number
  ) => {
    return (
      pricingMap[backendName]?.price ??
      fallback
    );
  };

  const identityServices: ServiceItem[] = [
    {
      name: "Aadhaar OTP",
      description:
        "Verify Aadhaar identity using OTP authentication.",
      price: getPrice("AADHAAR_OTP", 0.75),
      status: "active",
      icon: <Fingerprint size={20} />,
      available: false,
      mode: "coming-soon",
      comingSoonCopy:
        "Aadhaar OTP is still warming up. Check back soon.",
    },
    {
      name: "PAN",
      description:
        "Instant PAN verification and validation.",
      price: getPrice("PAN_VERIFY", 1.2),
      status: "active",
      icon: <CreditCard size={20} />,
      available: true,
      mode: "single",
      endpoint: "/verifications/pan",
      requestKey: "pan",
      inputLabel: "PAN Number",
      placeholder: "ABCDE1234F",
    },
    {
      name: "PAN 360",
      description:
        "Comprehensive PAN intelligence profile.",
      price: getPrice("PAN_360", 4.5),
      status: "beta",
      icon: <IdCard size={20} />,
      available: true,
      mode: "single",
      endpoint: "/verifications/pan-360",
      requestKey: "pan",
      inputLabel: "PAN Number",
      placeholder: "ABCDE1234F",
    },
    {
      name: "Passport",
      description: "Government passport verification.",
      price: getPrice("PASSPORT", 8),
      status: "live",
      icon: <Globe size={20} />,
      available: false,
      mode: "coming-soon",
      comingSoonCopy:
        "Passport verification is in the suitcase, not on the runway yet.",
    },
    {
      name: "Driving License",
      description:
        "Verify driving licence information.",
      price: getPrice("DRIVING_LICENSE", 2),
      status: "active",
      icon: <IdCard size={20} />,
      available: true,
      mode: "driving-license",
      endpoint: "/verifications/driving-license",
      inputLabel: "Driving License Number",
      comingSoonCopy: "",
    },
    {
      name: "Voter ID",
      description:
        "Instant voter ID validation service.",
      price: getPrice("VOTER_ID", 1.5),
      status: "active",
      icon: <IdCard size={20} />,
      available: true,
      mode: "single",
      endpoint: "/verifications/voter-id",
      requestKey: "voterId",
      inputLabel: "Voter ID Number",
      placeholder: "ABC1234567",
    },
    {
      name: "DigiLocker",
      description:
        "Fetch verified Aadhaar documents.",
      price: getPrice("DIGILOCKER", 3),
      status: "beta",
      icon: <Fingerprint size={20} />,
      available: false,
      mode: "coming-soon",
      comingSoonCopy:
        "DigiLocker is still doing pushups backstage.",
    },
  ];

  const businessServices: ServiceItem[] = [
    {
      name: "GSTIN",
      description:
        "GST registration verification.",
      price: getPrice("GST_VERIFY", 1),
      status: "active",
      icon: <Building size={20} />,
      available: true,
      mode: "single",
      endpoint: "/verifications/gst",
      requestKey: "gstin",
      inputLabel: "GSTIN",
      placeholder: "27AAECS1234F1ZV",
    },
    {
      name: "PAN To GSTIN",
      description:
        "Discover GSTINs associated with PAN.",
      price: getPrice("PAN_TO_GSTIN", 2),
      status: "active",
      icon: <Link size={20} />,
      available: true,
      mode: "single",
      endpoint: "/verifications/pan-to-gstin",
      requestKey: "pan",
      inputLabel: "PAN Number",
      placeholder: "ABCDE1234F",
    },
    {
      name: "CIN Lookup",
      description:
        "Ministry of Corporate Affairs lookup.",
      price: getPrice("CIN_LOOKUP", 4),
      status: "live",
      icon: <Search size={20} />,
      available: true,
      mode: "single",
      endpoint: "/verifications/cin-lookup",
      requestKey: "cin",
      inputLabel: "CIN Number",
      placeholder: "U12345MH2020PTC123456",
    },
    {
      name: "UDYAM",
      description:
        "Verify MSME registration details.",
      price: getPrice("UDYAM", 2.5),
      status: "active",
      icon: <Building2 size={20} />,
      available: true,
      mode: "single",
      endpoint: "/verifications/udyam",
      requestKey: "udyamNumber",
      inputLabel: "UDYAM Number",
      placeholder: "UDYAM-XX-00-0000000",
    },
    {
      name: "PAN To UDYAM",
      description:
        "Reverse lookup UDYAM records.",
      price: getPrice("PAN_TO_UDYAM", 3),
      status: "beta",
      icon: <ArrowLeftRight size={20} />,
      available: true,
      mode: "pan-udyam",
      endpoint: "/verifications/pan-to-udyam",
      inputLabel: "PAN + CSV Upload",
    },
  ];

  const faceServices: ServiceItem[] = [
    {
      name: "Face Match",
      description:
        "AI powered facial identity matching.",
      price: getPrice("FACE_MATCH", 1.5),
      status: "live",
      icon: <ScanFace size={20} />,
      available: false,
      mode: "coming-soon",
      comingSoonCopy:
        "Face Match is still getting its sunglasses on.",
    },
    {
      name: "Face Liveness",
      description:
        "Detect spoofing and fake identities.",
      price: getPrice("FACE_LIVENESS", 6),
      status: "beta",
      icon: <Camera size={20} />,
      available: false,
      mode: "coming-soon",
      comingSoonCopy:
        "Face Liveness is in the lab doing secret agent work.",
    },
    {
      name: "Name Match",
      description:
        "Fuzzy name verification engine.",
      price: getPrice("NAME_MATCH", 0.5),
      status: "active",
      icon: <Type size={20} />,
      available: false,
      mode: "coming-soon",
      comingSoonCopy:
        "Name Match is still learning the alphabet in style.",
    },
  ];

  const utilityServices: ServiceItem[] = [
    {
      name: "Vehicle RC",
      description:
        "Vehicle registration lookup.",
      price: getPrice("VEHICLE_RC", 1.5),
      status: "active",
      icon: <Car size={20} />,
      available: true,
      mode: "single",
      endpoint: "/verifications/vehicle-rc",
      requestKey: "vehicleNumber",
      inputLabel: "Vehicle RC Number",
      placeholder: "DL1AB1234",
    },
    {
      name: "Reverse Geocode",
      description:
        "Convert coordinates into addresses.",
      price: getPrice("REVERSE_GEOCODE", 0.8),
      status: "live",
      icon: <MapPin size={20} />,
      available: false,
      mode: "coming-soon",
      comingSoonCopy:
        "Reverse Geocode is still trying to remember directions.",
    },
    {
      name: "Number Lookup",
      description:
        "Telecom operator and circle lookup.",
      price: getPrice("NUMBER_LOOKUP", 0.4),
      status: "active",
      icon: <Phone size={20} />,
      available: true,
      mode: "single",
      endpoint: "/verifications/number-lookup",
      requestKey: "number",
      inputLabel: "Mobile Number",
      placeholder: "9876543210",
    },
  ];

  const financialServices: ServiceItem[] = [
    {
      name: "Penny Drop",
      description:
        "Bank account ownership verification.",
      price: getPrice("PENNY_DROP", 2),
      status: "live",
      icon: <Wallet size={20} />,
      available: true,
      mode: "bank",
      endpoint: "/verifications/penny-drop",
      inputLabel: "Bank Account + IFSC",
    },
    {
      name: "Employment 360",
      description:
        "Employment background intelligence.",
      price: getPrice("EMPLOYMENT_360", 12),
      status: "beta",
      icon: <Briefcase size={20} />,
      available: false,
      mode: "coming-soon",
      comingSoonCopy:
        "Employment 360 is still in its interview round.",
    },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setPageError("");

        const meResponse = await api.get("/users/me");
        const me = meResponse.data as { id: string };

        const [dashboardResponse, pricingResponse] =
          await Promise.all([
            api.get(`/dashboard/${me.id}`),
            api.get("/pricing"),
          ]);

        const dashboard =
          dashboardResponse.data as DashboardPayload;

        const pricingItems =
          pricingResponse.data?.value ??
          pricingResponse.data ??
          [];

        const map: Record<string, PricingItem> = {};

        (pricingItems as PricingItem[]).forEach((item) => {
          map[item.serviceName] = item;
        });

        setPricingMap(map);

        setActiveApiKey(
          dashboard.apiKeys?.find((k) => k.isActive)
            ?.apiKey ?? ""
        );
      } catch (err: any) {
        console.error(err);
        setPageError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load services."
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const matchesFilter = (
    _status: string,
    available: boolean
  ) => {
    if (filter === "All") return true;

    if (filter === "Active") {
      return available;
    }

    if (filter === "Inactive") {
      return !available;
    }

    return true;
  };

  const filterServices = (services: ServiceItem[]) =>
    services.filter((service) => {
      const searchMatch = service.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const statusMatch = matchesFilter(
        service.status,
        service.available
      );

      return searchMatch && statusMatch;
    });

  const filteredIdentity = filterServices(
    identityServices
  );
  const filteredBusiness = filterServices(
    businessServices
  );
  const filteredFace = filterServices(faceServices);
  const filteredUtility = filterServices(
    utilityServices
  );
  const filteredFinancial = filterServices(
    financialServices
  );

  const totalResults =
    filteredIdentity.length +
    filteredBusiness.length +
    filteredFace.length +
    filteredUtility.length +
    filteredFinancial.length;

  const ServiceSectionAny = ServiceSection as any;

  return (
    <div className="p-6">
      <ServicesToolbar
        search={search}
        onSearch={setSearch}
      />

      <div className="mb-6 flex gap-8 text-sm text-slate-500">
        <span>{totalResults} endpoints</span>
        <span>5 categories</span>
      </div>

      {pageError && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {pageError}
        </div>
      )}

      <ServiceFilters
        selected={filter}
        onSelect={setFilter}
      />

      {loading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--foreground-muted)]">
          Loading services...
        </div>
      ) : totalResults === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ServiceSectionAny
            title="Identity Verification"
            services={filteredIdentity}
            icon={<ShieldCheck size={20} />}
            activeApiKey={activeApiKey}
          />

          <ServiceSectionAny
            title="Business Verification"
            services={filteredBusiness}
            icon={<Building2 size={20} />}
            activeApiKey={activeApiKey}
          />

          <ServiceSectionAny
            title="Face Verification"
            services={filteredFace}
            icon={<ScanFace size={20} />}
            activeApiKey={activeApiKey}
          />

          <ServiceSectionAny
            title="Utility"
            services={filteredUtility}
            icon={<Wrench size={20} />}
            activeApiKey={activeApiKey}
          />

          <ServiceSectionAny
            title="Financial"
            services={filteredFinancial}
            icon={<Wallet size={20} />}
            activeApiKey={activeApiKey}
          />
        </>
      )}
    </div>
  );
}