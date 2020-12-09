CREATE INDEX $ASSEMBLY_vista_enhancer_ccre_index ON $ASSEMBLY_vista_enhancers(ccre);
CREATE INDEX $ASSEMBLY_vista_enhancer_coordinate_index ON $ASSEMBLY_vista_enhancers(chromosome, startpos, endpos);
CREATE INDEX $ASSEMBLY_vista_enhancer_accession_index ON $ASSEMBLY_vista_enhancers(accession);
CREATE INDEX $ASSEMBLY_vista_enhancer_activity_index ON $ASSEMBLY_vista_enhancers(activity);
