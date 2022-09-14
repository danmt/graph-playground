declare module 'cytoscape-node-html-label' {
    declare global {
    namespace cytoscape {
        interface Core {
            /*
             * Set up the context menu according to the given options.
             */
            nodeHtmlLabel: (...options?: any) => any;
        }
    }
}
}

