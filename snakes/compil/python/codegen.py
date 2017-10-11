import inspect
import snakes.compil.ast as ast

##
## to be included in the generated source code
##

def statespace () :
    "compute the marking graph"
    todo = set([init()])
    done = set()
    succ = set()
    g = {}
    while todo:
        state = todo.pop()
        done.add(state)
        addsucc(state, succ)
        if state not in g :
            g[state] = set()
        g[state].update(succ)
        succ.difference_update(done)
        succ.difference_update(todo)
        todo.update(succ)
        succ.clear()
    return g

def reachable ():
    "compute all the reachable markings"
    return set(statespace())

def deadlocks () :
    return set(m for m, s in statespace().items() if not s)

class CodeGenerator (ast.CodeGenerator) :
    def visit_Module (self, node) :
        self.write("# %s\n\nNET = %r\n" % (self.timestamp(), node.name))
        self.children_visit(node.body)
        self.write("\n%s" % inspect.getsource(reachable))
        self.write("\n%s" % inspect.getsource(statespace))
        self.write("\n%s" % inspect.getsource(deadlocks))
    def visit_DefineMarking (self, node) :
        self.fill("from snakes.nets import Marking, mset, dot\n")
    def visit_DefSuccProc (self, node) :
        self.fill("def ")
        self.visit(node.name)
        self.write(" (%s, %s):" % (node.marking, node.succ))
        with self.indent() :
            if node.name.trans :
                self.fill(repr("successors of %r" % node.name.trans))
            else :
                self.fill(repr("successors for all transitions"))
        self.children_visit(node.body, True)
        self.write("\n")
    def visit_IfInput (self, node) :
        self.fill("if %s:" % " and ".join("%s[%r]" % (node.marking, p)
                                          for p in node.places))
        self.children_visit(node.body, True)
    def visit_IfToken (self, node) :
        self.fill("if %r in %s[%r]:" % (node.token.source, node.marking, node.place))
        self.children_visit(node.body, True)
    def visit_ForeachToken (self, node) :
        self.fill("for %s in %s[%r]:" % (node.variable, node.marking, node.place))
        self.children_visit(node.body, True)
    def visit_IfGuard (self, node) :
        self.fill("if %s:" % node.guard.source)
        self.children_visit(node.body, True)
    def visit_IfType (self, node) :
        if node.place.type is None :
            self.children_visit(node.body, False)
        elif node.place.type.endswith("()") :
            self.fill("if %s(%s):" % (node.place.type[:-2], node.token.source))
            self.children_visit(node.body, True)
        else :
            self.fill("if isinstance(%s, %s):" % (node.token.source, node.place.type))
            self.children_visit(node.body, True)
    def visit_AddSuccIfEnoughTokens (self, node) :
        subvar = node.NAMES.fresh(base="sub", add=True)
        addvar = node.NAMES.fresh(base="add", add=True)
        for name, change in ((subvar, node.sub), (addvar, node.add)) :
            self.fill("%s = Marking({" % name)
            for i, (place, tokens) in enumerate(change.items()) :
                if i > 0 :
                    self.write(", ")
                self.write("%r: mset({" % place)
                for j, (tok, num) in enumerate(tokens.pairs()) :
                    if j > 0 :
                        self.write(", ")
                    self.write("%s: %s" % (tok.source, num))
                self.write("})")
            self.write("})")
        self.fill("try:")
        with self.indent() :
            self.fill("%s.add(%s - %s + %s)" % (node.succ, node.old, subvar, addvar))
        self.fill("except ValueError:")
        with self.indent() :
            self.fill("pass")
    def visit_DefSuccFunc (self, node) :
        self.fill("def ")
        self.visit(node.name)
        self.write(" (%s):" % node.marking)
        with self.indent() :
            if node.name.trans :
                self.fill(repr("successors of %r" % node.name.trans))
            else :
                self.fill(repr("successors for all transitions"))
        self.children_visit(node.body, True)
        self.write("\n")
    def visit_InitSucc (self, node) :
        self.fill("%s = set()" % node.name)
    def visit_CallSuccProc (self, node) :
        self.fill()
        self.visit(node.name)
        self.write("(%s, %s)" % (node.marking, node.succ))
    def visit_ReturnSucc (self, node) :
        self.fill("return %s" % node.name)
    def visit_DefInitFunc (self, node) :
        self.fill("def ")
        self.visit(node.name)
        self.write(" ():")
        with self.indent() :
            self.fill(repr("initial marking"))
            self.fill("return Marking({")
            for i, place in enumerate(node.marking) :
                if i > 0 :
                    self.write(", ")
                self.visit(place)
        self.write("})\n")
    def visit_PlaceMarking (self, node) :
        self.write("%r: mset([" % node.place)
        for i, tok in enumerate(node.tokens) :
            if i > 0 :
                self.write(", %s" % tok.source)
            else :
                self.write(tok.source)
        self.write("])")
    def visit_SuccProcTable (self, node) :
        self.fill("# map transitions names to successor procs")
        self.fill("# None maps to all-transitions proc")
        self.fill("succproc = {")
        for i, (trans, name) in enumerate(self.succproc.items()) :
            if i == 0 == len(self.succproc) - 1 :
                self.write("%r: %s}" % (trans, name))
            elif i == 0 :
                self.write("%r: %s," % (trans, name))
            elif i == len(self.succproc) - 1 :
                self.fill("            %r: %s}" % (trans, name))
            else :
                self.fill("            %r: %s," % (trans, name))
        self.write("\n")
    def visit_SuccFuncTable (self, node) :
        self.fill("# map transitions names to successor funcs")
        self.fill("# None maps to all-transitions func")
        self.fill("succfunc = {")
        for i, (trans, name) in enumerate(self.succfunc.items()) :
            if i == 0 == len(self.succfunc) - 1 :
                self.write("%r: %s}" % (trans, name))
            elif i == 0 :
                self.write("%r: %s," % (trans, name))
            elif i == len(self.succfunc) - 1 :
                self.fill("            %r: %s}" % (trans, name))
            else :
                self.fill("            %r: %s," % (trans, name))
        self.write("\n")

if __name__ == "__main__" :
    import io
    from snakes.io.snk import Parser
    net = Parser(open("test/simple-python.snk").read()).parse()
    gen = CodeGenerator(io.StringIO())
    gen.visit(net.__ast__())
    print(gen.output.getvalue().rstrip())
