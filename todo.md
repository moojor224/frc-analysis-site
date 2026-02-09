# TODO

## General

- [x] createAnalyticsPage&lt;DataTypes>(PickerComponent, BodyComponent)
- [x] tabbed view for each analytics page, managed by createAnalyticsPage
- [x] tab selector mobile: < # >
    - [x] alternate idea acquired: scrolling tabs
- [x] reorganize folder structure to match page layout
- [x] make app installable as PWA
    - [x] host on github pages
    - [x] make this its own repo
- [ ] Add comsume/produce docs for pipeline steps and their overloads
- [ ] input pipeline step: don't show ui if all steps are raw
- [x] usePersistentState hook that wraps useState and persistValue
    - [x] cache PipelineRenderer's:
        - values
        - activeStep
        - lastRunStep
        - apiError
- [x] auto-select lowest new tab number from currently used ids
- [ ] add autocomplete input for pipeline input step
    - [ ] convert team input to autocomplete
        - maybe make dedicated team input
- [ ] add default value for pipeline input and optional/required indicator
- [ ] add message to api pipeline step for loading bar

## Event analysis

- [ ] graphs
    - [x] total RP
        - x: match number
        - y: total RP
        - table ranked high->low total RP
        - table for per-match PP/stats for selected team
    - [ ] penalty points differential
        - x: team number
        - y: penalty points diff
            - calculated from net PP gained for/against team
        - [x] table ranked high->low differential

## More analytics

- [ ] year, team?, district? > event > match > match breakdown like on FIRST website
    - [ ] per-year custom diagram and/or generic match breakdown
