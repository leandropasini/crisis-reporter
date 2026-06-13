# UNDP Crisis Reporter — Proposal FINAL
*Version 2.0 — May 27, 2026*

---

## PROBLEM & OPPORTUNITY

Extreme climate events are no longer a future scenario. They are a present condition, the direct symptom of what scientific consensus now calls the Anthropocene. Since the Industrial Revolution, no other force has reshaped the planet's systems as drastically as human action, and the consequences are now arriving as floods, fires, and storms with frequencies and intensities that exceed what existing crisis response infrastructures were designed to absorb.

Within this context, two responses are possible. The first is preventive: renewable energy, reduced carbon footprint, planetary stewardship for future generations. The second is responsive, and it is the focus of this proposal. When extreme events arrive, the most resilient forces capable of containing their impact are deeply human ones: culture, education, coordinated collective action. Technology has a role, but only as a touchpoint within a much larger ecosystem of preparedness.

Technology is part of human culture. As a species, we are fragile and exposed. We have only survived by adapting through the tools we create. Current crisis reporting tools tend to position the citizen as a data entry point, a passive source of raw information. This is the gap we are addressing. A person living in a flood-affected neighborhood is not merely a data provider. They are an interconnected node of local knowledge, spatial awareness, and contextual judgment. When equipped with the right technology, that person becomes part of a coordinated intelligence network capable of scaling rapidly and making a decisive difference in the moments that matter most.

Treating people as data providers means forgetting that they are the territory itself. Residents carry irreplaceable knowledge: not just of streets and buildings, but of social bonds, informal networks, and the tacit intelligence that only comes from living in a place. This is why the app is designed not as a standalone reporting tool, but as the visible touchpoint of a broader preparedness ecosystem. Its effectiveness depends and builds upon a prior investment in community readiness: education, simulation, cultural familiarity with coordinated response. The technology amplifies what communities already know how to do. Without that foundation, no app alone can support communities effectively in the first 48 hours.

To arrive at these conclusions, we studied real events: the Rio Grande do Sul floods in Brazil in 2024, the Los Angeles wildfires in 2025, and the Pakistan floods of 2022, among others. Each had human stories. Each was lived by people who were present and who acted. Technology was there too, in every instance: a phone, a broadcast, a shared map. But the decisive force was never the tool. It was the human judgment behind it: who to call, where to go, who to carry. In Porto Alegre in 2024, the greatest rescue efforts came not from formal response systems, but from ordinary citizens who arrived by boat and jet ski from neighboring areas, self-organized, guided by neighborhood knowledge, reaching people that no official map had yet marked. This is the capacity this proposal is designed to amplify.

---

## SOLUTION OVERVIEW

The 2024 Rio Grande do Sul floods produced two stories that together define the problem this proposal addresses.

In the early hours of May 5, Elizabeth Vitalino sent her daughter a voice message from her ground-floor apartment in Porto Alegre's Humaitá neighborhood. The water was three fingers from the door. Her phone battery was nearly gone. "I can't get out of here," she said. "Everything is gone. Zero. Zero. Zero. Zero." Then silence, for hours. Her daughter Thais posted a plea on social media: "I need a rescue number that works. I need to get my mother out." Teams were contacted. Nothing. Beth was only confirmed safe at 5:24 that afternoon.

The same event produced a parallel story. A group of professors from UniRitter built Salva RS in hours, converting distress calls into geolocated rescue routes that assisted over 12,000 rescues by May 9th. It worked. But it required intermediaries: someone to receive the call, someone to place the point. Every delay was a person still waiting.

This proposal removes the intermediary. The app transforms any citizen into a direct node in the community response network, designed for the moment Beth was in: phone at 5%, hands trembling, no time. Open the app. Point at the building. One tap to photograph. Location captured automatically. Three taps to classify. Submit. Under thirty seconds, with no account, no registration.

When a citizen submits, they immediately see how many reports exist within 1.2 kilometers in the last 48 hours and the distribution of damage severity across those reports. They are not transmitting into silence. They are joining a community-powered situational awareness layer. Each submission strengthens the collective signal.

The platform is built as an offline-first, multilingual system designed for low-connectivity environments. Reports queue locally when networks fail and synchronize automatically once connectivity is restored. Interactive building footprints associate reports with precise structures even when GPS accuracy is degraded. Geospatial clustering surfaces damage concentration patterns without manual aggregation. The backend supports structured geospatial storage, report versioning, and duplicate detection at scale. Data exports in CSV, GeoJSON, and REST API formats enable direct integration into GIS platforms and existing UNDP response workflows.

The system adapts to the phase of the crisis. Emergency level is determined automatically by elapsed time since onset, with minimal flow in the first hours and progressively richer classification as response capacity grows, with operator override at any point. The agent dashboard aggregates observations into a real-time heat map, prioritized by damage concentration and cross-referenced with population density and infrastructure criticality. A future layer will extend the system to distress signals, location-based alerts submitted on behalf of others without photographic evidence, expanding the model from damage assessment toward integrated crisis response.

The citizen is the sensor. The community is the map.

---

## EXPERIENCE

Between 2020 and 2021, I led the development of ReDUS (Rede para o Desenvolvimento Urbano Sustentável), a national network and collaborative platform designed to strengthen multi-stakeholder collaboration around sustainable urban development. The project was developed in partnership with GIZ (Deutsche Gesellschaft für Internationale Zusammenarbeit), Brazil's Ministry of Cities, the National Front of Mayors (FNP), and Fundação Tide Setubal. The platform supported participatory processes across all 26 Brazilian states and the Federal District, including state-level city conferences connecting thousands of public managers, civil society representatives, and local communities around shared urban agendas, operating simultaneously across regions with vastly different levels of digital infrastructure, institutional capacity, and connectivity.

Building and operating ReDUS at that scale required solving problems that no technology alone could resolve. It required designing participation flows that worked under real conditions: low bandwidth, limited time, distributed actors with no shared institutional culture, and populations navigating digital tools in contexts of uncertainty. Every design decision was tested against the friction of actual use.

The same operational constraints observed in large-scale civic participation systems are intensified during crises. Low connectivity, fragmented information, distributed actors, and cognitive overload do not disappear in disaster contexts. They accelerate. This proposal applies those accumulated lessons directly to the first 48 hours of disaster response.

The decision to reduce the citizen reporting flow to under thirty seconds is not a UX preference. It is the operational conclusion of designing systems for populations who cannot afford friction.

Prior to ReDUS, my work at Instituto Tellus focused on public service transformation projects involving governments, civil society, and local communities across Brazil. At Sebrae for Startups, I led large-scale innovation initiatives involving multi-stakeholder coordination across distributed networks, reinforcing the importance of transforming fragmented local knowledge into structured signals that support institutional decision-making at scale.

The methodology behind this proposal is grounded in Design Doing, a systems-oriented approach developed and applied across real public-sector transformation projects. Rather than separating research, design, and implementation into isolated phases, it operates through continuous cycles of learning, operational testing, and adaptation in resource-constrained civic environments. That logic directly informs the platform's structure: built to perform under real crisis conditions, not ideal ones.

What this proposal brings is the combination of national-scale platform leadership, a decade of experience designing for high-pressure public-sector environments, and the practical knowledge of orchestrating complex multi-actor civic systems, applied to the moments that matter most.

---

## SOLUTION FEASIBILITY

A working prototype is available for evaluation today. The app is deployed, testable, and demonstrates the core reporting and coordination flows described in this proposal. The codebase is open source and publicly accessible on GitHub.

**Live prototype:** https://crisis-reporter.vercel.app

The current MVP includes the complete citizen reporting flow: camera capture, automatic GPS location, interactive building footprint selection, damage classification, and submission in under thirty seconds with no account or registration required. The agent dashboard aggregates observations into a real-time heat map with filters by damage level, data export in CSV and GeoJSON formats, and REST API access for integration with existing GIS platforms and UNDP response workflows. The Community Impact View shows citizens how many reports exist within 1.2 kilometers in the last 48 hours upon submission, closing the feedback loop between individual contribution and collective signal. A public Community Map provides a real-time view of all reports in the affected area, accessible without authentication. The interface is available in all six official UN languages.

The technical stack was selected for resilience and interoperability in low-resource environments. The frontend is built with React 18 and Vite, optimized for mobile performance. The backend runs on Supabase with PostGIS for geospatial queries, supporting structured storage, report versioning, and duplicate detection at scale. Building footprints are rendered via OpenStreetMap layers, enabling precise structure identification even when GPS accuracy is degraded. Reports queue locally via IndexedDB when networks fail, photo data is preserved throughout the offline cycle, and synchronization occurs automatically once connectivity is restored.

The architecture is designed to support progressive deployment across three operational phases: minimal flow in the first hours, richer classification as response capacity grows, and full damage assessment in the recovery phase, with operator override at any point. Phase determination will be informed not only by elapsed time since crisis onset, but by triangulation with territorial data layers, including socioeconomic vulnerability indices, critical infrastructure mapping, and historical risk records, enabling context-aware calibration of emergency level rather than time-based thresholds alone. This adaptive layer is planned for the next development phase, building directly on the crisis configuration infrastructure already in place.

The roadmap extends the current MVP in two directions. The first is contextual intelligence: cross-referencing citizen reports with population density, socioeconomic vulnerability indices, and critical infrastructure layers to support automated prioritization in the agent dashboard. The second is a Distress Signal layer, enabling location-based alerts submitted on behalf of others without photographic evidence, expanding the model from damage assessment toward integrated crisis response. Both are architectural extensions of what exists today, not new systems.

The methodology applied throughout development follows Design Doing principles: continuous cycles of operational testing, adaptation, and feedback in real-use conditions. The platform was not designed to perform under ideal scenarios. It was designed to remain functional when infrastructure fails, connectivity drops, and users are operating under extreme stress.

---

## SOLUTION RISKS

Every crisis reporting system operates under a fundamental tension: the moments when it is most needed are precisely the moments when the conditions for its use are most degraded. This proposal was designed with that tension as a primary constraint, not an edge case.

The first and most significant risk is adoption before the crisis. A reporting tool that citizens encounter for the first time during a disaster will not be used effectively. Familiarity, even minimal, is a prerequisite for function under stress. The mitigation strategy is integration with existing community preparedness programs and civil defense networks, positioning the app as part of routine disaster readiness rather than emergency response alone. Zero-friction design, with no account, no registration, and no tutorial required, reduces the barrier to first use to its practical minimum.

The second risk is data quality and reliability. In high-stress environments, reports may be imprecise, duplicated, or inconsistently classified. The architecture addresses this through multiple layers. Building footprint selection anchors reports to specific structures rather than approximate coordinates, reducing location ambiguity. Duplicate detection at the database level filters redundant submissions from the same area and timeframe. Report versioning enables corrections without data loss. The agent dashboard positions a trained operator as the validation layer between citizen signal and institutional response. Raw data never becomes operational intelligence without human confirmation.

The third risk is infrastructure failure. Connectivity is frequently the first casualty of a major disaster. The offline-first architecture directly addresses this: reports queue locally via IndexedDB when networks fail, photo data is preserved throughout the offline cycle, and synchronization occurs automatically once connectivity is restored. The app shell loads and functions without internet access, ensuring the reporting flow remains available regardless of network conditions.

The fourth risk is scale under peak load. A significant crisis event generates concentrated, simultaneous usage that standard architectures are not designed to absorb. The backend is built on Supabase with PostGIS, partitioned by crisis_id, with geospatial queries optimized for high-volume concurrent access. The architecture was designed for scale from the outset, not as a retrofit.

The fifth risk is deliberate misuse. In polarized or high-stakes environments, bad actors may submit false reports to misdirect response resources. The versioning system creates a full audit trail for every observation, enabling rapid identification and reversal of anomalous data. Photo evidence anchors each report to a physical reality. The agent layer provides a human checkpoint before any citizen report influences resource allocation decisions.

Taken together, these mitigations reflect a core design principle: the system was not built to function under ideal conditions. It was built to remain useful when conditions are worst.

---

## ONLINE REFERENCES

**Crisis events studied**

2024 Rio Grande do Sul floods, overview and scale:
https://pt.wikipedia.org/wiki/Enchentes_no_Rio_Grande_do_Sul_em_2024

Elizabeth Vitalino / Beth story (BBC News Brasil via Terra):
https://www.terra.com.br/noticias/brasil/a-bateria-esta-quase-no-final-filha-o-desespero-de-ficar-horas-sem-contato-por-causa-das-enchentes-no-rs,345d127c73a5cd1819456a461bed1f460ml0adir.html

Citizen rescuers, boats and jet skis, Porto Alegre:
https://www.directrelief.org/2024/07/amid-brazils-deadly-floods-daring-water-rescues-were-only-the-beginning/

2025 Los Angeles wildfires:
https://en.wikipedia.org/wiki/2025_Los_Angeles_wildfires

2022 Pakistan floods:
https://en.wikipedia.org/wiki/2022_Pakistan_floods

**Academic and institutional references**

Social media in citizen-led disaster response (rescuer, dispatcher, compiler roles; feedback loop gaps):
https://par.nsf.gov/biblio/10076203

UNHCR response to RS 2024 floods:
https://www.unhcr.org/us/news/press-releases/unhcr-helping-people-impacted-floods-brazil

**Platform and methodology**

ReDUS, Rede para o Desenvolvimento Urbano Sustentável:
https://www.redus.org.br

Crisis Reporter, open source repository:
https://github.com/leandropasini/crisis-reporter

Crisis Reporter, live prototype:
https://crisis-reporter.vercel.app

Design Doing methodology:
https://www.institutotellus.org.br
